"""
OfferCompare Pro - Node Tests
Comprehensive test coverage for all PocketFlow nodes
"""

import pytest
from unittest.mock import patch, MagicMock
import json

# Import nodes to test
from nodes import (
    OfferCollectionNode,
    MarketResearchNode,
    COLAdjustmentNode,
    MarketBenchmarkingNode,
    PreferenceScoringNode,
    AIAnalysisNode,
    VisualizationPreparationNode,
    ReportGenerationNode
)


class TestOfferCollectionNode:
    """Test offer collection and user input validation."""
    
    def test_node_initialization(self):
        """Test node can be initialized."""
        node = OfferCollectionNode()
        assert node is not None
    
    @patch('builtins.input', side_effect=['3', '2', 'Google', 'Software Engineer', 'Seattle', '150000', '30000', '15000', '5', '4', 'Microsoft', 'Senior SWE', 'Remote', '160000', '25000', '20000', '6', '4'])
    def test_node_execution(self, mock_input):
        """Test node execution with mocked input."""
        node = OfferCollectionNode()
        shared = {}
        
        prep_result = node.prep(shared)
        exec_result = node.exec(prep_result)
        post_result = node.post(shared, prep_result, exec_result)
        
        # Verify offers were collected
        assert "offers" in shared
        assert "user_preferences" in shared
        assert len(shared["offers"]) == 2
        assert shared["offers"][0]["company"] == "Google"
        assert shared["offers"][1]["company"] == "Microsoft"


class TestMarketResearchNode:
    """Test market research and company intelligence gathering."""
    
    def setup_method(self):
        """Set up test data."""
        self.sample_shared = {
            "offers": [
                {
                    "id": "offer_1",
                    "company": "Google",
                    "position": "Software Engineer",
                    "location": "Seattle, WA"
                },
                {
                    "id": "offer_2",
                    "company": "Microsoft", 
                    "position": "Senior Software Engineer",
                    "location": "Remote"
                }
            ]
        }
    
    def test_prep_method(self):
        """Test preparation of research items."""
        node = MarketResearchNode()
        prep_result = node.prep(self.sample_shared)
        
        assert isinstance(prep_result, list)
        assert len(prep_result) == 2
        assert prep_result[0]["offer_id"] == "offer_1"
        assert prep_result[0]["company"] == "Google"
        assert prep_result[1]["company"] == "Microsoft"
    
    @patch('nodes.research_company')
    @patch('nodes.get_market_sentiment')
    @patch('nodes.get_company_data')
    @patch('nodes.enrich_company_data')
    def test_exec_method(self, mock_enrich, mock_company_db, mock_sentiment, mock_research):
        """Test research execution with mocked dependencies."""
        # Setup mocks
        mock_research.return_value = {
            "company_name": "Google",
            "research_analysis": "Test analysis",
            "metrics": {"culture_score": {"score": 8}}
        }
        mock_sentiment.return_value = {
            "company_name": "Google",
            "sentiment_analysis": "Positive sentiment"
        }
        mock_company_db.return_value = {
            "industry": "Technology",
            "glassdoor_rating": 4.3
        }
        mock_enrich.return_value = {
            "industry": "Technology",
            "size": "Large"
        }
        
        node = MarketResearchNode()
        prep_result = node.prep(self.sample_shared)
        exec_result = node.exec(prep_result)
        
        assert isinstance(exec_result, list)
        assert len(exec_result) == 2
        assert exec_result[0]["offer_id"] == "offer_1"
        assert "company_research" in exec_result[0]
        assert "market_sentiment" in exec_result[0]
    
    def test_post_method(self):
        """Test enrichment of offers with research data."""
        node = MarketResearchNode()
        prep_result = [{"offer_id": "offer_1", "company": "Google"}]
        exec_result = [{
            "offer_id": "offer_1",
            "company_research": {"analysis": "test"},
            "market_sentiment": {"sentiment": "positive"},
            "company_db_data": {"rating": 4.3},
            "enriched_data": {"industry": "tech"}
        }]
        
        shared = {"offers": [{"id": "offer_1", "company": "Google"}]}
        node.post(shared, prep_result, exec_result)
        
        # Verify enrichment
        offer = shared["offers"][0]
        assert "company_research" in offer
        assert "market_sentiment" in offer
        assert "company_db_data" in offer
        assert "enriched_data" in offer


class TestCOLAdjustmentNode:
    """Test cost of living adjustment calculations."""
    
    def setup_method(self):
        """Set up test data."""
        self.sample_shared = {
            "offers": [
                {
                    "id": "offer_1",
                    "company": "Google",
                    "base_salary": 150000,
                    "total_compensation": 200000,
                    "location": "Seattle, WA"
                }
            ],
            "user_preferences": {
                "base_location": "San Francisco, CA"
            }
        }
    
    def test_prep_method(self):
        """Test preparation of adjustment items."""
        node = COLAdjustmentNode()
        prep_result = node.prep(self.sample_shared)
        
        assert isinstance(prep_result, list)
        assert len(prep_result) == 1
        assert prep_result[0]["offer_id"] == "offer_1"
        assert prep_result[0]["base_location"] == "San Francisco, CA"
    
    @patch('nodes.calculate_col_adjustment')
    @patch('nodes.get_location_insights')
    def test_exec_method(self, mock_insights, mock_adjustment):
        """Test COL calculation execution."""
        mock_adjustment.return_value = {
            "adjusted_salary": 160000,
            "adjustment_factor": 1.067,
            "purchasing_power_ratio": 0.94
        }
        mock_insights.return_value = {
            "cost_category": "High Cost",
            "analysis": "Expensive location"
        }
        
        node = COLAdjustmentNode()
        prep_result = node.prep(self.sample_shared)
        exec_result = node.exec(prep_result)
        
        assert isinstance(exec_result, list)
        assert len(exec_result) == 1
        assert "salary_adjustment" in exec_result[0]
        assert "location_insights" in exec_result[0]


class TestMarketBenchmarkingNode:
    """Test market salary benchmarking."""
    
    def setup_method(self):
        """Set up test data."""
        self.sample_shared = {
            "offers": [
                {
                    "id": "offer_1",
                    "company": "Google",
                    "position": "Software Engineer",
                    "location": "Seattle, WA",
                    "base_salary": 150000,
                    "total_compensation": 200000,
                    "equity": 30000,
                    "bonus": 20000,
                    "years_experience": 5
                }
            ]
        }
    
    @patch('nodes.get_compensation_insights')
    @patch('nodes.calculate_market_percentile')
    @patch('nodes.ai_market_analysis')
    def test_exec_method(self, mock_ai_analysis, mock_percentile, mock_insights):
        """Test market benchmarking execution."""
        mock_insights.return_value = {
            "position_analysis": "Good fit",
            "market_comparison": "Above average"
        }
        mock_percentile.side_effect = [
            {"market_percentile": 75, "competitiveness": "Above Market"},
            {"market_percentile": 80, "competitiveness": "Above Market"}
        ]
        mock_ai_analysis.return_value = {
            "ai_analysis": "Strong market position"
        }
        
        node = MarketBenchmarkingNode()
        prep_result = node.prep(self.sample_shared)
        exec_result = node.exec(prep_result)
        
        assert isinstance(exec_result, list)
        assert len(exec_result) == 1
        assert "market_insights" in exec_result[0]
        assert "market_analysis" in exec_result[0]
        assert "total_comp_analysis" in exec_result[0]


class TestPreferenceScoringNode:
    """Test preference-based scoring."""
    
    def setup_method(self):
        """Set up test data with enriched offers."""
        self.sample_shared = {
            "offers": [
                {
                    "id": "offer_1",
                    "company": "Google",
                    "position": "Software Engineer",
                    "base_salary": 150000,
                    "equity": 30000,
                    "market_analysis": {"market_percentile": 75},
                    "total_comp_analysis": {"market_percentile": 80},
                    "company_research": {
                        "stage": "public",
                        "metrics": {
                            "wlb_score": {"score": 8},
                            "growth_score": {"score": 9},
                            "culture_score": {"score": 8}
                        }
                    }
                }
            ],
            "user_preferences": {
                "growth_focused": True,
                "custom_weights": {}
            }
        }
    
    @patch('nodes.calculate_offer_score')
    @patch('nodes.compare_offers')
    @patch('nodes.customize_weights')
    def test_exec_method(self, mock_weights, mock_compare, mock_score):
        """Test preference scoring execution."""
        mock_weights.return_value = {
            "base_salary": 0.25,
            "career_growth": 0.30,
            "work_life_balance": 0.20
        }
        mock_score.return_value = {
            "total_score": 85.5,
            "rating": "Very Good",
            "factor_scores": {"base_salary": 80, "career_growth": 90}
        }
        mock_compare.return_value = {
            "ranked_offers": [{"company": "Google", "total_score": 85.5}],
            "top_offer": {"company": "Google"},
            "comparison_summary": "Google is the top choice"
        }
        
        node = PreferenceScoringNode()
        prep_result = node.prep(self.sample_shared)
        exec_result = node.exec(prep_result)
        
        assert isinstance(exec_result, dict)
        assert "offers_with_scores" in exec_result
        assert "comparison_results" in exec_result
        assert "weights_used" in exec_result


class TestAIAnalysisNode:
    """Test AI-powered analysis and recommendations."""
    
    def setup_method(self):
        """Set up test data."""
        self.sample_shared = {
            "offers": [
                {
                    "id": "offer_1",
                    "company": "Google",
                    "total_score": 85.5,
                    "rating": "Very Good"
                }
            ],
            "comparison_results": {
                "top_offer": {"company": "Google"},
                "comparison_summary": "Strong offer"
            },
            "user_preferences": {
                "growth_focused": True
            }
        }
    
    @patch('nodes.call_llm')
    def test_exec_method(self, mock_llm):
        """Test AI analysis execution."""
        mock_llm.side_effect = [
            "Comprehensive analysis of offers...",
            "Strong recommendation for Google",
            "Decision framework: Consider growth potential..."
        ]
        
        node = AIAnalysisNode()
        prep_result = node.prep(self.sample_shared)
        exec_result = node.exec(prep_result)
        
        assert isinstance(exec_result, dict)
        assert "ai_analysis" in exec_result
        assert "recommendation" in exec_result
        assert "decision_framework" in exec_result


class TestVisualizationPreparationNode:
    """Test visualization data preparation."""
    
    def setup_method(self):
        """Set up test data."""
        self.sample_shared = {
            "offers": [
                {
                    "company": "Google",
                    "base_salary": 150000,
                    "total_score": 85.5,
                    "factor_scores": {
                        "base_salary": 80,
                        "career_growth": 90
                    }
                }
            ],
            "weights_used": {
                "base_salary": 0.25,
                "career_growth": 0.30
            }
        }
    
    @patch('nodes.create_visualization_package')
    def test_exec_method(self, mock_viz_package):
        """Test visualization preparation execution."""
        mock_viz_package.return_value = {
            "radar_chart": {"data": [], "labels": []},
            "comparison_table": {"headers": [], "rows": []},
            "summary_stats": {"total_offers": 1}
        }
        
        node = VisualizationPreparationNode()
        prep_result = node.prep(self.sample_shared)
        exec_result = node.exec(prep_result)
        
        assert isinstance(exec_result, dict)
        assert "visualization_data" in exec_result
        assert "charts_ready" in exec_result


class TestReportGenerationNode:
    """Test final report generation."""
    
    def setup_method(self):
        """Set up comprehensive test data."""
        self.sample_shared = {
            "offers": [
                {
                    "company": "Google",
                    "position": "Software Engineer",
                    "total_score": 85.5,
                    "rating": "Very Good"
                }
            ],
            "comparison_results": {
                "top_offer": {"company": "Google"},
                "comparison_summary": "Strong choice"
            },
            "ai_analysis": "Comprehensive analysis...",
            "visualization_data": {
                "summary_stats": {"total_offers": 1}
            },
            "user_preferences": {
                "growth_focused": True
            }
        }
    
    def test_exec_method(self):
        """Test report generation execution."""
        node = ReportGenerationNode()
        prep_result = node.prep(self.sample_shared)
        exec_result = node.exec(prep_result)
        
        assert isinstance(exec_result, dict)
        assert "final_report" in exec_result
        assert "executive_summary" in exec_result
        assert "analysis_metadata" in exec_result
        
        final_report = exec_result["final_report"]
        assert "analysis_date" in final_report
        assert "offers_analyzed" in final_report
        assert "top_recommendation" in final_report


class TestNodeIntegration:
    """Test node interactions and flow integration."""
    
    def setup_method(self):
        """Set up nodes for integration testing."""
        self.market_node = MarketResearchNode()
        self.col_node = COLAdjustmentNode()
        self.benchmark_node = MarketBenchmarkingNode()
    
    def test_data_flow_between_nodes(self):
        """Test that data flows correctly between nodes."""
        # Start with basic shared data
        shared = {
            "offers": [
                {
                    "id": "offer_1",
                    "company": "Google",
                    "position": "Software Engineer",
                    "location": "Seattle, WA",
                    "base_salary": 150000,
                    "total_compensation": 200000
                }
            ],
            "user_preferences": {
                "base_location": "San Francisco, CA"
            }
        }
        
        # Test that each node can process the shared data
        # without actually calling external APIs
        
        # Market Research prep should work
        market_prep = self.market_node.prep(shared)
        assert len(market_prep) == 1
        assert market_prep[0]["company"] == "Google"
        
        # COL Adjustment prep should work
        col_prep = self.col_node.prep(shared)
        assert len(col_prep) == 1
        assert col_prep[0]["base_salary"] == 150000
        
        # Market Benchmarking prep should work
        benchmark_prep = self.benchmark_node.prep(shared)
        assert len(benchmark_prep) == 1
        assert benchmark_prep[0]["position"] == "Software Engineer"
    
    def test_shared_data_enrichment(self):
        """Test that shared data gets properly enriched by nodes."""
        shared = {
            "offers": [{"id": "offer_1", "company": "Google"}]
        }
        
        # Simulate market research enrichment
        prep_result = [{"offer_id": "offer_1"}]
        exec_result = [{
            "offer_id": "offer_1",
            "company_research": {"analysis": "test"},
            "market_sentiment": {"sentiment": "positive"},
            "company_db_data": {"rating": 4.3},
            "enriched_data": {"industry": "tech"}
        }]
        
        self.market_node.post(shared, prep_result, exec_result)
        
        # Verify shared data was enriched
        offer = shared["offers"][0]
        assert "company_research" in offer
        assert "market_sentiment" in offer
        assert offer["company_research"]["analysis"] == "test"


# Test fixtures
@pytest.fixture
def sample_shared_data():
    """Sample shared data for testing."""
    return {
        "offers": [
            {
                "id": "offer_1",
                "company": "Google",
                "position": "Senior Software Engineer",
                "location": "Seattle, WA",
                "base_salary": 180000,
                "equity": 50000,
                "bonus": 20000,
                "total_compensation": 250000,
                "years_experience": 6,
                "vesting_years": 4
            }
        ],
        "user_preferences": {
            "growth_focused": True,
            "base_location": "San Francisco, CA",
            "custom_weights": {}
        }
    }


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 