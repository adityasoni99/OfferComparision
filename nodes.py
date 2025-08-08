"""
OfferCompare Pro - Node Implementations
Complete set of nodes for intelligent job offer analysis and comparison
"""

from pocketflow import Node, BatchNode, AsyncNode, AsyncBatchNode
from utils.call_llm import call_llm, call_llm_structured, call_llm_async, call_llm_structured_async
from utils.web_research import research_company, get_market_sentiment, research_company_async, get_market_sentiment_async
from utils.col_calculator import calculate_col_adjustment, get_location_insights
from utils.market_data import (get_compensation_insights, calculate_market_percentile, ai_market_analysis,
                              get_compensation_insights_async, calculate_market_percentile_async, ai_market_analysis_async)
from utils.scoring import calculate_offer_score, compare_offers, customize_weights
from utils.viz_formatter import create_visualization_package
from utils.company_db import get_company_data, enrich_company_data
import json
import asyncio

class OfferCollectionNode(Node):
    """
    Collect and validate comprehensive offer data from user input.
    Handles multiple job offers with detailed information.
    """
    
    def prep(self, shared):
        """Initialize empty offers list and user preferences."""
        if "offers" not in shared:
            shared["offers"] = []
        if "user_preferences" not in shared:
            shared["user_preferences"] = {}
        return {"existing_offers": len(shared["offers"])}
    
    def exec(self, prep_data):
        """Collect offer information from user with comprehensive validation."""
        offers = []
        
        print("\n🎯 Welcome to OfferCompare Pro - Intelligent Job Offer Analysis!")
        print("=" * 60)
        
        # Collect user preferences first
        print("\n📊 First, let's understand your priorities...")
        priorities = self._collect_user_priorities()
        
        # Collect offers
        num_offers = self._get_number_of_offers()
        
        for i in range(num_offers):
            print(f"\n💼 Collecting details for Offer #{i+1}")
            print("-" * 40)
            offer = self._collect_single_offer(i+1)
            if offer:
                offers.append(offer)
        
        return {
            "offers": offers,
            "user_preferences": priorities,
            "collection_summary": f"Collected {len(offers)} offers successfully"
        }
    
    def post(self, shared, prep_res, exec_res):
        """Store collected offers and preferences in shared store."""
        shared["offers"] = exec_res["offers"]
        shared["user_preferences"] = exec_res["user_preferences"]
        shared["collection_summary"] = exec_res["collection_summary"]
        
        print(f"\n✅ {exec_res['collection_summary']}")
        return "default"
    
    def _collect_user_priorities(self):
        """Collect user priorities and preferences."""
        print("What's most important to you in a job offer?")
        print("1. Salary and compensation")
        print("2. Career growth and learning")
        print("3. Work-life balance")
        print("4. Mixed priorities")
        
        choice = input("Enter your choice (1-4): ").strip()
        
        priorities = {}
        if choice == "1":
            priorities["salary_focused"] = True
        elif choice == "2":
            priorities["growth_focused"] = True
        elif choice == "3":
            priorities["balance_focused"] = True
        else:
            priorities["mixed"] = True
        
        return priorities
    
    def _get_number_of_offers(self):
        """Get number of offers to compare."""
        while True:
            try:
                num = int(input("\nHow many job offers would you like to compare? (2-10): "))
                if 2 <= num <= 10:
                    return num
                else:
                    print("Please enter a number between 2 and 10.")
            except ValueError:
                print("Please enter a valid number.")
    
    def _collect_single_offer(self, offer_num):
        """Collect comprehensive details for a single offer."""
        offer = {"id": f"offer_{offer_num}"}
        
        # Basic information
        offer["company"] = input("Company name: ").strip()
        offer["position"] = input("Position title: ").strip()
        offer["location"] = input("Location (e.g., 'Seattle, WA' or 'Remote'): ").strip()
        
        # Compensation details
        try:
            offer["base_salary"] = float(input("Base salary ($): ").replace("$", "").replace(",", ""))
            
            equity_input = input("Annual equity value ($ or press Enter for 0): ").strip()
            offer["equity"] = float(equity_input.replace("$", "").replace(",", "")) if equity_input else 0
            
            bonus_input = input("Annual bonus ($ or press Enter for 0): ").strip()
            offer["bonus"] = float(bonus_input.replace("$", "").replace(",", "")) if bonus_input else 0
            
            offer["total_compensation"] = offer["base_salary"] + offer["equity"] + offer["bonus"]
            
        except ValueError:
            print("⚠️ Invalid salary format. Please enter numbers only.")
            return None
        
        # Additional details
        offer["years_experience"] = self._get_optional_int("Years of experience for this role", default=5)
        offer["vesting_years"] = self._get_optional_int("Equity vesting period (years)", default=4)
        
        return offer
    
    def _get_optional_int(self, prompt, default=None):
        """Get optional integer input with default."""
        user_input = input(f"{prompt} (default {default}): ").strip()
        if not user_input and default is not None:
            return default
        try:
            return int(user_input)
        except ValueError:
            return default if default is not None else 0

class MarketResearchNode(AsyncBatchNode):
    """
    Gather comprehensive market intelligence for each company using AI agents.
    Uses AsyncBatchNode for efficient parallel I/O operations.
    """
    
    async def prep_async(self, shared):
        """Extract company and position details for research."""
        offers = shared.get("offers", [])
        research_items = []
        
        for offer in offers:
            research_items.append({
                "offer_id": offer.get("id"),
                "company": offer.get("company", "Unknown"),
                "position": offer.get("position", "Unknown"),
                "location": offer.get("location", "Unknown")
            })
        
        return research_items
    
    async def exec_async(self, research_item):
        """
        Conduct AI-powered research for a single company.
        Uses async I/O for parallel processing.
        """
        print(f"\n🔍 Conducting market research for {research_item['company']}...")
        
        # Parallel async calls for research data
        company_research = await research_company_async(research_item["company"], research_item["position"])
        market_sentiment = await get_market_sentiment_async(research_item["company"], research_item["position"])
        
        # These are local operations, so keep sync for now
        company_db_data = get_company_data(research_item["company"])
        enriched_data = enrich_company_data(research_item["company"], {
            "position_context": research_item["position"],
            "location": research_item["location"]
        })
        
        return {
            "offer_id": research_item["offer_id"],
            "company_research": company_research,
            "market_sentiment": market_sentiment,
            "company_db_data": company_db_data,
            "enriched_data": enriched_data
        }
    
    async def post_async(self, shared, prep_res, exec_res_list):
        """Enrich offers with research data."""
        research_lookup = {r.get("offer_id"): r for r in exec_res_list if isinstance(r, dict)}
        
        # Enrich each offer with research data
        for offer in shared["offers"]:
            if offer["id"] in research_lookup:
                research_data = research_lookup[offer["id"]]
                offer["company_research"] = research_data["company_research"]
                offer["market_sentiment"] = research_data["market_sentiment"]
                offer["company_db_data"] = research_data["company_db_data"]
                offer["enriched_data"] = research_data["enriched_data"]
        
        print(f"✅ Market research completed for {len(exec_res)} companies")
        return "default"

class COLAdjustmentNode(BatchNode):
    """
    Apply location-based compensation normalization for fair comparison.
    Calculates cost of living adjustments for each offer.
    """
    
    def prep(self, shared):
        """Extract offers and user location preference."""
        offers = shared.get("offers", [])
        user_base_location = shared.get("user_preferences", {}).get("base_location", "San Francisco, CA")
        
        adjustment_items = []
        for offer in offers:
            adjustment_items.append({
                "offer_id": offer["id"],
                "company": offer["company"],
                "base_salary": offer["base_salary"],
                "total_compensation": offer["total_compensation"],
                "location": offer["location"],
                "base_location": user_base_location
            })
        
        return adjustment_items
    
    def exec(self, item):
        """Calculate cost of living adjustments. Accepts a single item or a list; always returns a list."""
        def process(single_item):
            print(f"\n💰 Calculating cost of living adjustment for {single_item['company']} ({single_item['location']})...")
            salary_adjustment = calculate_col_adjustment(
                single_item["base_salary"],
                single_item["location"],
                single_item["base_location"]
            )
            total_comp_adjustment = calculate_col_adjustment(
                single_item["total_compensation"],
                single_item["location"],
                single_item["base_location"]
            )
            location_insights = get_location_insights(single_item["location"])
            return {
                "offer_id": single_item["offer_id"],
                "salary_adjustment": salary_adjustment,
                "total_comp_adjustment": total_comp_adjustment,
                "location_insights": location_insights
            }
        
        if isinstance(item, list):
            return [process(i) for i in item]
        return [process(item)]
    
    def post(self, shared, prep_res, exec_res):
        """Update offers with cost of living adjustments."""
        flat_results = []
        for r in exec_res:
            if isinstance(r, list):
                flat_results.extend(r)
            else:
                flat_results.append(r)
        adjustment_lookup = {r.get("offer_id"): r for r in flat_results if isinstance(r, dict)}
        
        for offer in shared["offers"]:
            if offer["id"] in adjustment_lookup:
                adjustment_data = adjustment_lookup[offer["id"]]
                offer["col_adjustment"] = adjustment_data["salary_adjustment"]
                offer["col_total_adjustment"] = adjustment_data["total_comp_adjustment"]
                offer["location_insights"] = adjustment_data["location_insights"]
                
                # Add adjusted values to offer
                offer["col_adjusted_salary"] = adjustment_data["salary_adjustment"]["adjusted_salary"]
                offer["col_adjusted_total"] = adjustment_data["total_comp_adjustment"]["adjusted_salary"]
                # Alias expected by some tests
                offer["col_analysis"] = adjustment_data["salary_adjustment"]
        
        print("✅ Cost of living adjustments completed")
        return "default"

class MarketBenchmarkingNode(AsyncBatchNode):
    """
    Compare each offer against industry market standards.
    Uses AsyncBatchNode for parallel market data API calls.
    """
    
    async def prep_async(self, shared):
        """Extract offer data for market comparison."""
        offers = shared.get("offers", [])
        benchmark_items = []
        
        for offer in offers:
            benchmark_items.append({
                "offer_id": offer["id"],
                "company": offer["company"],
                "position": offer["position"],
                "location": offer["location"],
                "base_salary": offer["base_salary"],
                "total_compensation": offer["total_compensation"],
                "equity": offer.get("equity", 0),
                "bonus": offer.get("bonus", 0),
                "years_experience": offer.get("years_experience", 5)
            })
        
        return benchmark_items
    
    async def exec_async(self, benchmark_item):
        """Perform market benchmarking for a single offer using async calls."""
        print(f"\n📊 Performing market benchmarking analysis for {benchmark_item['company']} {benchmark_item['position']}...")
        
        # Parallel async calls for market data
        compensation_insights = await get_compensation_insights_async(
            benchmark_item["position"],
            benchmark_item["base_salary"],
            benchmark_item["equity"],
            benchmark_item["bonus"],
            benchmark_item["location"]
        )
        
        base_percentile = await calculate_market_percentile_async(
            benchmark_item["base_salary"],
            benchmark_item["position"],
            benchmark_item["location"]
        )
        
        total_percentile = await calculate_market_percentile_async(
            benchmark_item["total_compensation"],
            benchmark_item["position"],
            benchmark_item["location"]
        )
        
        ai_analysis = await ai_market_analysis_async(
            benchmark_item["position"],
            benchmark_item["location"],
            benchmark_item["base_salary"],
            benchmark_item["years_experience"]
        )
        
        # Include alias keys expected by tests
        return {
            "offer_id": benchmark_item["offer_id"],
            "compensation_insights": compensation_insights,
            "market_insights": compensation_insights,
            "base_percentile": base_percentile,
            "market_analysis": base_percentile,
            "total_percentile": total_percentile,
            "total_comp_analysis": total_percentile,
            "ai_analysis": ai_analysis
        }
    
    async def post_async(self, shared, prep_res, exec_res_list):
        """Add market benchmarking data to offers."""
        benchmark_lookup = {r.get("offer_id"): r for r in exec_res_list if isinstance(r, dict)}
        
        for offer in shared["offers"]:
            if offer["id"] in benchmark_lookup:
                benchmark_data = benchmark_lookup[offer["id"]]
                offer["market_analysis"] = benchmark_data["base_percentile"]
                offer["total_comp_analysis"] = benchmark_data["total_percentile"]
                offer["compensation_insights"] = benchmark_data["compensation_insights"]
                offer["ai_market_analysis"] = benchmark_data["ai_analysis"]
        
        print("✅ Market benchmarking completed")
        return "default"

class PreferenceScoringNode(BatchNode):
    """
    Calculate personalized scores based on user-defined weightings.
    Uses BatchNode to process each offer individually with user preferences.
    """
    
    def prep(self, shared):
        """Prepare offer-preference pairs for individual scoring."""
        offers = shared.get("offers", [])
        user_preferences = shared.get("user_preferences", {})
        
        # Return list of (offer, preferences) tuples for batch processing
        return [(offer, user_preferences) for offer in offers]
    
    def exec(self, offer_with_prefs):
        """Calculate score for a single offer with user preferences."""
        offer, user_preferences = offer_with_prefs
        
        print(f"\n🎯 Calculating personalized score for {offer.get('company', 'Unknown')}...")
        
        # Customize weights based on user priorities  
        weights = customize_weights(user_preferences)
        
        # Calculate score for this specific offer
        score_data = calculate_offer_score(offer, user_preferences, weights)
        
        return {
            "offer_id": offer["id"],
            "score_data": score_data,
            "weights_used": weights
        }
    
    def post(self, shared, prep_res, exec_res_list):
        """Store scoring results and generate comparison."""
        # Add individual scores to offers
        score_lookup = {s["offer_id"]: s["score_data"] for s in exec_res_list}
        
        for offer in shared["offers"]:
            if offer["id"] in score_lookup:
                offer["score_data"] = score_lookup[offer["id"]]
        
        # Generate comparison results using all scored offers
        user_preferences = shared.get("user_preferences", {})
        weights = exec_res_list[0]["weights_used"] if exec_res_list else customize_weights(user_preferences)
        comparison_results = compare_offers(shared["offers"], user_preferences, weights)
        
        # Store comparison results and weights
        shared["comparison_results"] = comparison_results
        shared["scoring_weights"] = weights
        
        print("✅ Personalized scoring completed")
        return "default"

class AIAnalysisNode(AsyncNode):
    """
    Generate comprehensive AI-powered recommendations and risk assessments.
    Provides detailed analysis and career trajectory insights.
    """
    
    async def prep_async(self, shared):
        """Prepare all processed offer data for AI analysis."""
        return {
            "offers": shared.get("offers", []),
            "comparison_results": shared.get("comparison_results", {}),
            "user_preferences": shared.get("user_preferences", {}),
            "scoring_weights": shared.get("scoring_weights", {})
        }
    
    async def exec_async(self, prep_data):
        """Generate comprehensive AI analysis using async LLM calls."""
        offers = prep_data["offers"]
        comparison_results = prep_data["comparison_results"]
        user_preferences = prep_data["user_preferences"]
        
        print(f"\n🤖 Generating AI-powered analysis and recommendations...")
        
        # Prepare comprehensive data for AI analysis
        analysis_prompt = self._build_analysis_prompt(offers, comparison_results, user_preferences)
        
        # Get comprehensive AI analysis with async LLM call
        ai_analysis = await call_llm_async(
            analysis_prompt,
            temperature=0.3,
            system_prompt="You are an expert career advisor and compensation analyst providing comprehensive job offer analysis."
        )
        
        # Generate specific recommendations for each offer (async)
        offer_recommendations = []
        for offer in offers:
            recommendation = await self._generate_offer_recommendation_async(offer, user_preferences)
            offer_recommendations.append({
                "offer_id": offer["id"],
                "recommendation": recommendation
            })
        
        # Generate decision framework (async)
        decision_framework = await self._generate_decision_framework_async(offers, comparison_results)
        
        return {
            "comprehensive_analysis": ai_analysis,
            "offer_recommendations": offer_recommendations,
            "decision_framework": decision_framework,
            # Aliases for tests
            "ai_analysis": ai_analysis,
            "recommendation": offer_recommendations[0]["recommendation"] if offer_recommendations else ""
        }
    
    async def post_async(self, shared, prep_res, exec_res):
        """Store AI analysis results."""
        # Add recommendations to individual offers
        rec_lookup = {r["offer_id"]: r["recommendation"] for r in exec_res["offer_recommendations"]}
        
        for offer in shared["offers"]:
            if offer["id"] in rec_lookup:
                offer["ai_recommendation"] = rec_lookup[offer["id"]]
        
        # Store comprehensive analysis
        shared["ai_analysis"] = exec_res["comprehensive_analysis"]
        shared["decision_framework"] = exec_res["decision_framework"]
        
        print("✅ AI analysis completed")
        return "default"
    
    def _build_analysis_prompt(self, offers, comparison_results, user_preferences):
        """Build comprehensive prompt for AI analysis."""
        prompt = f"""
        Analyze these {len(offers)} job offers and provide comprehensive insights:

        USER PRIORITIES: {user_preferences}

        OFFERS SUMMARY:
        """
        
        for offer in offers:
            prompt += f"""
        {offer.get('company', 'Unknown')} - {offer.get('position', 'Unknown')} ({offer.get('location', 'Unknown')})
        - Base Salary: ${offer.get('base_salary', 0):,}
        - Total Comp: ${offer.get('total_compensation', offer.get('base_salary', 0) + offer.get('equity', 0) + offer.get('bonus', 0)):,}
        - Market Percentile: {offer.get('market_analysis', {}).get('market_percentile', 'N/A')}
        - Score: {offer.get('score_data', {}).get('total_score', 'N/A')}
        """
        
        prompt += f"""
        
        TOP CHOICE: {comparison_results.get('top_offer', {}).get('company', 'N/A')}
        
        Please provide:
        1. Executive summary of the offer comparison
        2. Detailed analysis of each offer's strengths and weaknesses
        3. Risk factors and considerations for each offer
        4. Career trajectory implications (1-5 year outlook)
        5. Negotiation opportunities and strategies
        6. Final recommendation with reasoning
        7. Red flags or concerns to watch out for
        8. Questions to ask each company before deciding
        
        Focus on actionable insights for decision-making.
        """
        
        return prompt
    
    async def _generate_offer_recommendation_async(self, offer, user_preferences):
        """Generate specific recommendation for an individual offer using async LLM."""
        prompt = f"""
        Provide a focused recommendation for this specific offer:
        
        Company: {offer.get('company', 'Unknown')}
        Position: {offer.get('position', 'Unknown')}
        Total Score: {offer.get('score_data', {}).get('total_score', offer.get('total_score', 'N/A'))}
        
        Based on the analysis, should this offer be:
        1. Strongly Recommended
        2. Recommended with Conditions
        3. Neutral/Consider Carefully
        4. Not Recommended
        
        Provide 2-3 key reasons for your recommendation.
        """
        
        return await call_llm_async(prompt, temperature=0.3)
    
    async def _generate_decision_framework_async(self, offers, comparison_results):
        """Generate a decision-making framework using async LLM."""
        prompt = f"""
        Create a decision framework for choosing between these {len(offers)} offers.
        
        Provide:
        1. Top 3 decision criteria to focus on
        2. Deal-breakers to watch for
        3. Questions to ask yourself before deciding
        4. Timeline recommendations for decision-making
        5. How to handle counteroffers
        
        Keep it practical and actionable.
        """
        
        return await call_llm_async(prompt, temperature=0.3)

class VisualizationPreparationNode(Node):
    """
    Prepare data for interactive charts and comparison visualizations.
    Creates Chart.js compatible data structures.
    """
    
    def prep(self, shared):
        """Prepare scored offers and weights for visualization."""
        return {
            "comparison_results": shared.get("comparison_results", {}),
            "scoring_weights": shared.get("scoring_weights", {})
        }
    
    def exec(self, prep_data):
        """Generate comprehensive visualization package."""
        comparison_results = prep_data["comparison_results"]
        scoring_weights = prep_data["scoring_weights"]
        
        print(f"\n📊 Preparing interactive visualizations...")
        
        ranked_offers = comparison_results.get("ranked_offers", [])
        
        # Create comprehensive visualization package
        viz_package = create_visualization_package(ranked_offers, scoring_weights)
        
        return {
            "visualization_data": viz_package,
            "chart_count": len([k for k in viz_package.keys() if k.endswith("_chart") or k.endswith("_comparison")]),
            "charts_ready": True
        }
    
    def post(self, shared, prep_res, exec_res):
        """Store visualization data."""
        shared["visualization_data"] = exec_res["visualization_data"]
        
        print(f"✅ Prepared {exec_res['chart_count']} interactive visualizations")
        return "default"

class ReportGenerationNode(Node):
    """
    Generate final comprehensive comparison report with actionable insights.
    Creates structured report with recommendations and visualizations.
    """
    
    def prep(self, shared):
        """Gather all analysis results for final report."""
        return {
            "offers": shared.get("offers", []),
            "comparison_results": shared.get("comparison_results", {}),
            "ai_analysis": shared.get("ai_analysis", ""),
            "decision_framework": shared.get("decision_framework", ""),
            "visualization_data": shared.get("visualization_data", {}),
            "user_preferences": shared.get("user_preferences", {})
        }
    
    def exec(self, prep_data):
        """Generate comprehensive final report."""
        print(f"\n📋 Generating comprehensive comparison report...")
        
        # Create structured report
        report = self._generate_structured_report(prep_data)
        
        # Generate executive summary
        executive_summary = self._generate_executive_summary(prep_data)
        
        # Create action items
        action_items = self._generate_action_items(prep_data)
        
        return {
            "final_report": report,
            "executive_summary": executive_summary,
            "action_items": action_items,
            "report_timestamp": "2024-01-01",  # In production, use actual timestamp
            # Added metadata for tests
            "analysis_metadata": {
                "offers": len(prep_data.get("offers", [])),
                "timestamp": "2024-01-01"
            }
        }
    
    def post(self, shared, prep_res, exec_res):
        """Store final report and display summary."""
        shared["final_report"] = exec_res["final_report"]
        shared["executive_summary"] = exec_res["executive_summary"]
        shared["action_items"] = exec_res["action_items"]
        
        # Display executive summary
        print("\n" + "="*80)
        print("🎯 OFFERCOMPARE PRO - EXECUTIVE SUMMARY")
        print("="*80)
        print(exec_res["executive_summary"])
        print("\n" + "="*80)
        
        print("✅ Comprehensive analysis completed!")
        return "default"
    
    def _generate_structured_report(self, data):
        """Generate the main structured report."""
        offers = data["offers"]
        comparison_results = data["comparison_results"]
        
        report = {
            "report_type": "OfferCompare Pro Analysis",
            "analysis_date": "2024-01-01",
            "offers_analyzed": len(offers),
            "top_recommendation": comparison_results.get("top_offer", {}).get("company", "N/A"),
            "detailed_analysis": data["ai_analysis"],
            "decision_framework": data["decision_framework"],
            "offer_rankings": comparison_results.get("ranked_offers", []),
            "visualization_summary": data["visualization_data"].get("summary_stats", {})
        }
        
        return report
    
    def _generate_executive_summary(self, data):
        """Generate executive summary for immediate decision-making."""
        comparison_results = data["comparison_results"]
        top_offer = comparison_results.get("top_offer", {})
        
        if not top_offer:
            return "No offers available for comparison."
        
        summary = f"""
🏆 TOP RECOMMENDATION: {top_offer.get('company', 'N/A')} - {top_offer.get('position', 'N/A')}
   Overall Score: {top_offer.get('total_score', 0):.1f}/100 ({top_offer.get('rating', 'N/A')})

📊 COMPARISON SUMMARY:
   {comparison_results.get('comparison_summary', 'Analysis completed')}

🎯 KEY INSIGHTS:
   • Total offers analyzed: {len(data['offers'])}
   • Score range: {data['visualization_data'].get('summary_stats', {}).get('score_range', {}).get('min', 0):.1f} - {data['visualization_data'].get('summary_stats', {}).get('score_range', {}).get('max', 0):.1f}
   • Average score: {data['visualization_data'].get('summary_stats', {}).get('avg_score', 0):.1f}

💡 NEXT STEPS:
   1. Review detailed analysis below
   2. Consider negotiation opportunities
   3. Ask clarifying questions to companies
   4. Make your decision with confidence!
        """
        
        return summary.strip()
    
    def _generate_action_items(self, data):
        """Generate specific action items for the user."""
        action_items = [
            "Review the detailed AI analysis for each offer",
            "Consider the decision framework provided",
            "Identify negotiation opportunities with top choices",
            "Prepare questions to ask companies before final decision",
            "Set a decision timeline and stick to it"
        ]
        
        return action_items