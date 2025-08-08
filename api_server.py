"""
OfferCompare Pro - FastAPI Server

Endpoints:
- GET  /health            -> health check
- GET  /api/demo          -> run analysis on sample offers
- POST /api/analyze       -> run analysis on posted offers and preferences

Run:
  uvicorn api_server:app --reload --port 8000
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from flow import get_sample_offers
from nodes import (
    MarketResearchNode,
    COLAdjustmentNode,
    MarketBenchmarkingNode,
    PreferenceScoringNode,
    AIAnalysisNode,
    VisualizationPreparationNode,
    ReportGenerationNode,
)
from pocketflow import Flow, AsyncFlow
from utils.call_llm import get_provider_info


class Offer(BaseModel):
    id: Optional[str] = None
    company: str
    position: str
    location: str
    base_salary: float
    equity: float = 0
    bonus: float = 0
    total_compensation: Optional[float] = None
    years_experience: Optional[int] = None
    vesting_years: Optional[int] = 4


class AnalyzeRequest(BaseModel):
    offers: List[Offer] = Field(default_factory=list)
    user_preferences: Dict[str, Any] = Field(default_factory=dict)


class AnalyzeResponse(BaseModel):
    executive_summary: str
    final_report: Dict[str, Any]
    comparison_results: Dict[str, Any]
    visualization_data: Dict[str, Any]
    offers: List[Dict[str, Any]]


app = FastAPI(title="OfferCompare Pro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, Any]:
    provider_info = get_provider_info()
    return {"status": "ok", "providers": provider_info}


def _build_flow() -> AsyncFlow:
    market_research = MarketResearchNode()
    col_adjustment = COLAdjustmentNode()
    market_benchmarking = MarketBenchmarkingNode()
    preference_scoring = PreferenceScoringNode()
    ai_analysis = AIAnalysisNode()
    visualization_prep = VisualizationPreparationNode()
    report_generation = ReportGenerationNode()

    market_research >> col_adjustment
    col_adjustment >> market_benchmarking
    market_benchmarking >> preference_scoring
    preference_scoring >> ai_analysis
    ai_analysis >> visualization_prep
    visualization_prep >> report_generation

    return AsyncFlow(start=market_research)


async def _run_analysis(shared: Dict[str, Any]) -> Dict[str, Any]:
    flow = _build_flow()
    await flow.run_async(shared)
    return shared


@app.get("/api/demo", response_model=AnalyzeResponse)
async def run_demo() -> AnalyzeResponse:
    shared = get_sample_offers()

    # Ensure totals are present
    for offer in shared["offers"]:
        offer.setdefault("total_compensation", offer.get("base_salary", 0) + offer.get("equity", 0) + offer.get("bonus", 0))

    try:
        result = await _run_analysis(shared)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return AnalyzeResponse(
        executive_summary=result.get("executive_summary", ""),
        final_report=result.get("final_report", {}),
        comparison_results=result.get("comparison_results", {}),
        visualization_data=result.get("visualization_data", {}),
        offers=result.get("offers", []),
    )


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    if not req.offers:
        raise HTTPException(status_code=400, detail="Offers list cannot be empty")

    # Prepare shared store
    offers = []
    for i, o in enumerate(req.offers, start=1):
        data = o.model_dump()
        data["id"] = data.get("id") or f"offer_{i}"
        if data.get("total_compensation") is None:
            data["total_compensation"] = data.get("base_salary", 0) + data.get("equity", 0) + data.get("bonus", 0)
        offers.append(data)

    shared = {
        "offers": offers,
        "user_preferences": req.user_preferences or {},
    }

    try:
        result = await _run_analysis(shared)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return AnalyzeResponse(
        executive_summary=result.get("executive_summary", ""),
        final_report=result.get("final_report", {}),
        comparison_results=result.get("comparison_results", {}),
        visualization_data=result.get("visualization_data", {}),
        offers=result.get("offers", []),
    )


