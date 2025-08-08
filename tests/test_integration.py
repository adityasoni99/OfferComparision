"""
OfferCompare Pro - Integration Tests
End-to-end testing of the complete flow and system integration
"""

import pytest
from unittest.mock import patch, MagicMock
import json
import tempfile
import os

# Import flow and main components
from flow import create_offer_comparison_flow, get_sample_offers
from nodes import MarketResearchNode
from pocketflow import Flow


class TestFlowIntegration:
    """Test complete flow integration and execution."""
    
    def test_create_offer_comparison_flow(self):
        """Test flow creation and node connections."""
        flow = create_offer_comparison_flow()
        
        assert isinstance(flow, Flow)
        assert flow.start is not None
        assert hasattr(flow.start, 'prep')
        assert hasattr(flow.start, 'exec')
        assert hasattr(flow.start, 'post')
    
    def test_get_sample_offers(self):
        """Test sample data generation."""
        sample_data = get_sample_offers()
        
        assert isinstance(sample_data, dict)
        assert "offers" in sample_data
        assert "user_preferences" in sample_data
        assert len(sample_data["offers"]) == 3
        
        # Verify offer structure
        offer = sample_data["offers"][0]
        required_fields = ["id", "company", "position", "location", "base_salary", "equity", "bonus"]
        for field in required_fields:
            assert field in offer
    
    @patch('utils.web_research.call_llm')
    @patch('utils.web_research.call_llm_structured')
    def test_flow_execution_with_sample_data(self, mock_structured, mock_llm):
        """Test complete flow execution with mocked API calls."""
        # Mock all LLM calls to avoid API dependencies
        mock_llm.return_value = "Mocked analysis response"
        mock_structured.return_value = json.dumps({
            "culture_score": {"score": 8, "explanation": "Good culture"},
            "wlb_score": {"score": 7, "explanation": "Good balance"},
            "growth_score": {"score": 9, "explanation": "High growth"},
            "benefits_score": {"score": 8, "explanation": "Good benefits"},
            "stability_score": {"score": 8, "explanation": "Stable"},
            "reputation_score": {"score": 9, "explanation": "Great reputation"},
            "key_strengths": ["innovation", "culture"],
            "potential_concerns": ["work pressure"],
            "recent_highlights": ["product launch"]
        })
        
        # Get sample data and create flow
        shared_data = get_sample_offers()
        
        # Create flow starting from MarketResearchNode to skip user input
        from nodes import (
            MarketResearchNode, COLAdjustmentNode, MarketBenchmarkingNode,
            PreferenceScoringNode, AIAnalysisNode, VisualizationPreparationNode,
            ReportGenerationNode
        )
        
        market_research = MarketResearchNode()
        col_adjustment = COLAdjustmentNode()
        market_benchmarking = MarketBenchmarkingNode()
        preference_scoring = PreferenceScoringNode()
        ai_analysis = AIAnalysisNode()
        visualization_prep = VisualizationPreparationNode()
        report_generation = ReportGenerationNode()
        
        # Connect nodes
        market_research >> col_adjustment
        col_adjustment >> market_benchmarking
        market_benchmarking >> preference_scoring
        preference_scoring >> ai_analysis
        ai_analysis >> visualization_prep
        visualization_prep >> report_generation
        
        test_flow = Flow(start=market_research)
        
        # Execute flow
        result = test_flow.run(shared_data)
        
        # Verify execution completed
        assert result is not None
        
        # Verify data enrichment occurred
        offers = shared_data["offers"]
        assert len(offers) == 3
        
        # Check that offers were enriched with analysis data
        first_offer = offers[0]
        assert "company_research" in first_offer
        assert "market_sentiment" in first_offer
        assert "col_analysis" in first_offer
        assert "market_analysis" in first_offer


class TestErrorHandling:
    """Test error handling and edge cases."""
    
    def test_flow_with_empty_offers(self):
        """Test flow behavior with empty offers list."""
        shared_data = {"offers": [], "user_preferences": {}}
        
        # Create minimal flow
        market_node = MarketResearchNode()
        flow = Flow(start=market_node)
        
        # Should handle empty offers gracefully
        result = flow.run(shared_data)
        assert result is not None
    
    def test_flow_with_malformed_data(self):
        """Test flow behavior with malformed offer data."""
        shared_data = {
            "offers": [
                {"id": "offer_1", "company": "Test"}  # Missing required fields
            ],
            "user_preferences": {}
        }
        
        market_node = MarketResearchNode()
        
        # Should handle missing fields gracefully in prep
        prep_result = market_node.prep(shared_data)
        assert isinstance(prep_result, list)
        assert len(prep_result) == 1
    
    @patch('utils.web_research.call_llm', side_effect=Exception("API Error"))
    def test_flow_with_api_failures(self, mock_llm):
        """Test flow behavior when API calls fail."""
        shared_data = get_sample_offers()
        market_node = MarketResearchNode()
        
        prep_result = market_node.prep(shared_data)
        
        # PocketFlow should handle exceptions with retry mechanism
        with pytest.raises(Exception):
            market_node.exec(prep_result)


class TestDataValidation:
    """Test data validation and consistency."""
    
    def test_offer_data_structure_consistency(self):
        """Test that all sample offers have consistent structure."""
        sample_data = get_sample_offers()
        offers = sample_data["offers"]
        
        # Get keys from first offer
        expected_keys = set(offers[0].keys())
        
        # Verify all offers have same keys
        for i, offer in enumerate(offers):
            assert set(offer.keys()) == expected_keys, f"Offer {i} has inconsistent structure"
            
            # Verify data types
            assert isinstance(offer["base_salary"], int)
            assert isinstance(offer["equity"], int)
            assert isinstance(offer["bonus"], int)
            assert isinstance(offer["years_experience"], int)
            assert isinstance(offer["vesting_years"], int)
    
    def test_user_preferences_structure(self):
        """Test user preferences data structure."""
        sample_data = get_sample_offers()
        preferences = sample_data["user_preferences"]
        
        assert isinstance(preferences, dict)
        assert "growth_focused" in preferences
        assert isinstance(preferences["growth_focused"], bool)
        
        if "location_preferences" in preferences:
            assert isinstance(preferences["location_preferences"], dict)


class TestPerformance:
    """Test performance and scalability."""
    
    @patch('utils.web_research.call_llm')
    @patch('utils.web_research.call_llm_structured')
    def test_flow_performance_with_multiple_offers(self, mock_structured, mock_llm):
        """Test flow performance with larger number of offers."""
        # Mock API calls
        mock_llm.return_value = "Quick analysis"
        mock_structured.return_value = json.dumps({
            "culture_score": {"score": 7, "explanation": "Good"},
            "wlb_score": {"score": 7, "explanation": "Good"},
            "growth_score": {"score": 7, "explanation": "Good"},
            "benefits_score": {"score": 7, "explanation": "Good"},
            "stability_score": {"score": 7, "explanation": "Good"},
            "reputation_score": {"score": 7, "explanation": "Good"},
            "key_strengths": ["strength1"],
            "potential_concerns": ["concern1"],
            "recent_highlights": ["highlight1"]
        })
        
        # Create test data with 10 offers
        shared_data = {
            "offers": [
                {
                    "id": f"offer_{i}",
                    "company": f"Company {i}",
                    "position": "Software Engineer",
                    "location": "Seattle, WA",
                    "base_salary": 150000 + i * 1000,
                    "equity": 30000,
                    "bonus": 20000,
                    "total_compensation": 200000 + i * 1000,
                    "years_experience": 5,
                    "vesting_years": 4
                }
                for i in range(1, 11)
            ],
            "user_preferences": {
                "growth_focused": True,
                "base_location": "San Francisco, CA"
            }
        }
        
        # Test market research node with 10 offers
        market_node = MarketResearchNode()
        prep_result = market_node.prep(shared_data)
        
        assert len(prep_result) == 10
        
        # Should complete in reasonable time
        import time
        start_time = time.time()
        exec_result = market_node.exec(prep_result)
        end_time = time.time()
        
        execution_time = end_time - start_time
        assert execution_time < 30  # Should complete within 30 seconds
        assert len(exec_result) == 10


class TestConfigurationManagement:
    """Test configuration and environment management."""
    
    def test_environment_variable_handling(self):
        """Test that missing environment variables are handled gracefully."""
        from utils.call_llm import get_provider_info
        
        # Should not crash even without API keys
        provider_info = get_provider_info()
        assert isinstance(provider_info, dict)
        assert "available_providers" in provider_info
    
    @patch.dict(os.environ, {"GEMINI_API_KEY": "test_key"})
    def test_provider_configuration(self):
        """Test AI provider configuration."""
        from utils.call_llm import get_provider_info
        
        provider_info = get_provider_info()
        assert "gemini" in provider_info["available_providers"]
        assert provider_info["default_provider"] == "gemini"


class TestDataPersistence:
    """Test data saving and loading functionality."""
    
    def test_result_serialization(self):
        """Test that analysis results can be serialized to JSON."""
        sample_data = get_sample_offers()
        
        # Ensure all data is JSON serializable
        try:
            json_str = json.dumps(sample_data, default=str)
            restored_data = json.loads(json_str)
            
            assert len(restored_data["offers"]) == len(sample_data["offers"])
            assert restored_data["offers"][0]["company"] == sample_data["offers"][0]["company"]
            
        except (TypeError, ValueError) as e:
            pytest.fail(f"Sample data is not JSON serializable: {e}")
    
    def test_save_analysis_results(self):
        """Test saving analysis results to file."""
        sample_data = get_sample_offers()
        
        # Add some analysis results
        sample_data["final_report"] = {
            "analysis_date": "2024-01-01",
            "top_offer": {"company": "Google"},
            "summary": "Analysis complete"
        }
        
        # Test saving to temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(sample_data, f, indent=2, default=str)
            temp_filename = f.name
        
        try:
            # Verify file was created and can be read
            assert os.path.exists(temp_filename)
            
            with open(temp_filename, 'r') as f:
                loaded_data = json.load(f)
            
            assert loaded_data["final_report"]["top_offer"]["company"] == "Google"
            
        finally:
            # Clean up
            if os.path.exists(temp_filename):
                os.unlink(temp_filename)


# Performance benchmarks
@pytest.mark.performance
class TestPerformanceBenchmarks:
    """Performance benchmarks for system components."""
    
    def test_col_calculation_performance(self):
        """Benchmark cost of living calculations."""
        from utils.col_calculator import calculate_col_adjustment
        
        import time
        start_time = time.time()
        
        # Run 100 calculations
        for i in range(100):
            calculate_col_adjustment(
                100000 + i * 1000,
                "San Francisco, CA",
                "Seattle, WA"
            )
        
        end_time = time.time()
        avg_time = (end_time - start_time) / 100
        
        # Should average less than 0.01 seconds per calculation
        assert avg_time < 0.01
    
    def test_scoring_performance(self):
        """Benchmark offer scoring calculations."""
        from utils.scoring import calculate_offer_score
        
        sample_offer = {
            "id": "test_offer",
            "company": "Test Company",
            "position": "Software Engineer",
            "base_salary": 150000,
            "equity": 30000,
            "market_analysis": {"market_percentile": 70},
            "total_comp_analysis": {"market_percentile": 75},
            "company_research": {
                "stage": "growth",
                "metrics": {
                    "wlb_score": {"score": 8},
                    "growth_score": {"score": 9},
                    "culture_score": {"score": 7}
                }
            }
        }
        
        import time
        start_time = time.time()
        
        # Run 100 scoring calculations
        for i in range(100):
            calculate_offer_score(sample_offer)
        
        end_time = time.time()
        avg_time = (end_time - start_time) / 100
        
        # Should average less than 0.005 seconds per calculation
        assert avg_time < 0.005


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 