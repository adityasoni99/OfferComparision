"""
Cost of Living Calculator - Location-based compensation adjustments
Calculates purchasing power parity and cost adjustments across locations
"""

import json

# Comprehensive cost of living indices (base: San Francisco = 100)
COST_OF_LIVING_DATA = {
    # Major US Tech Hubs
    "San Francisco, CA": 100.0,
    "San Jose, CA": 95.0,
    "Palo Alto, CA": 110.0,
    "Mountain View, CA": 105.0,
    "New York, NY": 85.0,
    "Manhattan, NY": 90.0,
    "Brooklyn, NY": 75.0,
    "Seattle, WA": 78.0,
    "Los Angeles, CA": 70.0,
    "San Diego, CA": 65.0,
    "Boston, MA": 72.0,
    "Cambridge, MA": 75.0,
    "Washington, DC": 68.0,
    "Chicago, IL": 55.0,
    "Denver, CO": 58.0,
    "Portland, OR": 60.0,
    "Austin, TX": 52.0,
    "Dallas, TX": 48.0,
    "Houston, TX": 45.0,
    "Atlanta, GA": 45.0,
    "Miami, FL": 50.0,
    "Phoenix, AZ": 42.0,
    "Las Vegas, NV": 40.0,
    "Salt Lake City, UT": 45.0,
    "Minneapolis, MN": 50.0,
    "Detroit, MI": 35.0,
    "Pittsburgh, PA": 38.0,
    "Philadelphia, PA": 55.0,
    "Raleigh, NC": 40.0,
    "Nashville, TN": 42.0,
    "Orlando, FL": 45.0,
    
    # International Tech Hubs
    "London, UK": 85.0,
    "Dublin, Ireland": 75.0,
    "Amsterdam, Netherlands": 78.0,
    "Berlin, Germany": 65.0,
    "Munich, Germany": 70.0,
    "Zurich, Switzerland": 120.0,
    "Geneva, Switzerland": 125.0,
    "Paris, France": 80.0,
    "Stockholm, Sweden": 75.0,
    "Copenhagen, Denmark": 85.0,
    "Oslo, Norway": 90.0,
    "Helsinki, Finland": 70.0,
    "Barcelona, Spain": 60.0,
    "Madrid, Spain": 62.0,
    "Milan, Italy": 68.0,
    "Rome, Italy": 65.0,
    "Vienna, Austria": 65.0,
    "Prague, Czech Republic": 45.0,
    "Warsaw, Poland": 40.0,
    "Budapest, Hungary": 38.0,
    
    # Asia-Pacific
    "Tokyo, Japan": 85.0,
    "Singapore": 95.0,
    "Hong Kong": 110.0,
    "Sydney, Australia": 80.0,
    "Melbourne, Australia": 75.0,
    "Toronto, Canada": 65.0,
    "Vancouver, Canada": 70.0,
    "Montreal, Canada": 55.0,
    "Tel Aviv, Israel": 75.0,
    "Seoul, South Korea": 70.0,
    "Taipei, Taiwan": 50.0,
    "Shanghai, China": 55.0,
    "Beijing, China": 60.0,
    "Shenzhen, China": 58.0,
    "Bangalore, India": 25.0,
    "Mumbai, India": 35.0,
    "Hyderabad, India": 22.0,
    "Delhi, India": 30.0,
    "Pune, India": 20.0,
    
    # Emerging Markets
    "Mexico City, Mexico": 30.0,
    "São Paulo, Brazil": 35.0,
    "Buenos Aires, Argentina": 25.0,
    "Lisbon, Portugal": 50.0,
    "Cape Town, South Africa": 28.0,
    "Dubai, UAE": 65.0,
    "Riyadh, Saudi Arabia": 50.0,
    "Cairo, Egypt": 18.0,
}

def normalize_location(location):
    """
    Normalize location string for consistent matching.
    
    Args:
        location (str): Location string
    
    Returns:
        str: Normalized location
    """
    location = location.strip()
    
    # Case-insensitive mappings and common synonyms
    location_mappings = {
        "sf": "San Francisco, CA",
        "san francisco": "San Francisco, CA",
        "san francisco, ca": "San Francisco, CA",
        "nyc": "New York, NY",
        "new york": "New York, NY",
        "new york, ny": "New York, NY",
        "la": "Los Angeles, CA",
        "los angeles": "Los Angeles, CA",
        "los angeles, ca": "Los Angeles, CA",
        "seattle": "Seattle, WA",
        "seattle, wa": "Seattle, WA",
        "bay area": "San Francisco, CA",
        "silicon valley": "San Jose, CA",
        "london": "London, UK",
        "berlin": "Berlin, Germany",
        "tokyo": "Tokyo, Japan",
        "singapore": "Singapore",
        "remote": "Remote"
    }
    
    lower_loc = location.lower()
    if lower_loc in location_mappings:
        return location_mappings[lower_loc]
    
    # Try exact key match in COST_OF_LIVING_DATA ignoring case
    for known in COST_OF_LIVING_DATA.keys():
        if known.lower() == lower_loc:
            return known
    
    # Fallback: Title-case unknown city names (retain original if looks custom)
    return location

def get_cost_index(location):
    """
    Get cost of living index for a location.
    
    Args:
        location (str): Location name
    
    Returns:
        float: Cost index (San Francisco = 100.0)
    """
    normalized_location = normalize_location(location)
    
    if normalized_location == "Remote":
        return 50.0  # Default for remote work
    
    return COST_OF_LIVING_DATA.get(normalized_location, 75.0)  # Default for unknown locations (per tests)

def calculate_col_adjustment(base_salary, from_location, to_location=None):
    """
    Calculate cost of living adjusted salary between locations.
    
    Args:
        base_salary (float): Base salary amount
        from_location (str): Original location
        to_location (str): Target location (optional, defaults to San Francisco)
    
    Returns:
        dict: Adjustment calculation results
    """
    if to_location is None:
        to_location = "San Francisco, CA"
    
    from_index = get_cost_index(from_location)
    to_index = get_cost_index(to_location)
    
    # Calculate adjustment factor
    adjustment_factor = to_index / from_index
    adjusted_salary = base_salary * adjustment_factor
    
    # Calculate purchasing power
    purchasing_power_ratio = from_index / to_index
    effective_value = base_salary * purchasing_power_ratio
    
    return {
        "original_salary": base_salary,
        "from_location": normalize_location(from_location),
        "to_location": normalize_location(to_location),
        "from_cost_index": from_index,
        "to_cost_index": to_index,
        "adjustment_factor": adjustment_factor,
        "adjusted_salary": round(adjusted_salary, 2),
        "purchasing_power_ratio": purchasing_power_ratio,
        "effective_value": round(effective_value, 2),
        "cost_difference_percent": round((adjustment_factor - 1) * 100, 1),
        "savings_potential": round(base_salary - effective_value, 2) if base_salary > effective_value else 0
    }

def compare_purchasing_power(*args, **kwargs):
    """
    Compare purchasing power between locations.
    
    Supports two calling patterns:
    1) compare_purchasing_power(salary, location, reference_locations=list[str])
       -> returns a summary with comparisons list
    2) compare_purchasing_power(salary1, location1, salary2, location2)
       -> returns direct comparison with keys expected by tests
    """
    # Pattern 2: direct two-location comparison
    if len(args) == 4 and not kwargs:
        salary1, location1, salary2, location2 = args
        idx1 = get_cost_index(location1)
        idx2 = get_cost_index(location2)
        # Effective value of salary in SF baseline terms
        effective1 = salary1 * (idx1 / 100.0)
        effective2 = salary2 * (idx2 / 100.0)
        better = location1 if effective1 >= effective2 else location2
        savings_diff = round(abs(effective1 - effective2), 2)
        return {
            "location1_effective": round(effective1, 2),
            "location2_effective": round(effective2, 2),
            "better_value": better,
            "savings_difference": savings_diff
        }
    
    # Pattern 1: one-to-many comparison
    salary = args[0]
    location = args[1]
    reference_locations = args[2] if len(args) > 2 else kwargs.get("reference_locations")
    if reference_locations is None:
        reference_locations = [
            "San Francisco, CA",
            "New York, NY", 
            "Seattle, WA",
            "Austin, TX",
            "Denver, CO",
            "Remote"
        ]
    
    base_index = get_cost_index(location)
    comparisons = []
    for ref_location in reference_locations:
        if ref_location != location:
            comparison = calculate_col_adjustment(salary, location, ref_location)
            comparisons.append(comparison)
    comparisons.sort(key=lambda x: x["effective_value"], reverse=True)
    return {
        "base_salary": salary,
        "base_location": normalize_location(location),
        "base_cost_index": base_index,
        "comparisons": comparisons,
        "best_value_location": comparisons[0]["to_location"] if comparisons else None,
        "worst_value_location": comparisons[-1]["to_location"] if comparisons else None
    }

def get_location_insights(location):
    """
    Get insights about a specific location for job seekers.
    
    Args:
        location (str): Location to analyze
    
    Returns:
        dict: Location insights
    """
    cost_index = get_cost_index(location)
    normalized_loc = normalize_location(location)
    
    # Categorize cost level
    if cost_index >= 90:
        cost_category = "Very High Cost"
        advice = "Consider negotiating higher compensation. Focus on equity and benefits."
    elif cost_index >= 70:
        cost_category = "High Cost" 
        advice = "Ensure salary adequately covers living expenses. Consider housing options."
    elif cost_index >= 50:
        cost_category = "Moderate Cost"
        advice = "Good balance of opportunities and cost. Evaluate career growth potential."
    elif cost_index >= 30:
        cost_category = "Low Cost"
        advice = "Great value for money. Consider long-term career prospects."
    else:
        cost_category = "Very Low Cost"
        advice = "Excellent cost of living. Evaluate market opportunities and growth."
    
    return {
        "location": normalized_loc,
        "cost_index": cost_index,
        "cost_category": cost_category,
        "relative_to_sf": f"{cost_index}% of San Francisco costs",
        "advice": advice,
        "is_tech_hub": normalized_loc in [
            "San Francisco, CA", "San Jose, CA", "Seattle, WA", "New York, NY",
            "Boston, MA", "Austin, TX", "London, UK", "Singapore", "Tokyo, Japan"
        ],
        # Added for tests expecting a narrative analysis field
        "analysis": f"{normalized_loc} is a {cost_category.lower()} area with cost index {cost_index}. {advice}"
    }

if __name__ == "__main__":
    # Test cost of living calculations
    adjustment = calculate_col_adjustment(150000, "San Francisco, CA", "Austin, TX")
    print("COL Adjustment:", json.dumps(adjustment, indent=2))
    
    purchasing_power = compare_purchasing_power(120000, "Seattle, WA")
    print("Purchasing Power:", json.dumps(purchasing_power, indent=2))
    
    insights = get_location_insights("Denver, CO")
    print("Location Insights:", json.dumps(insights, indent=2)) 