from fastapi import APIRouter, HTTPException

from schemas.itinerary import PlanRequest, PlanResponse
from services.planner_service import generate_plan

router = APIRouter()


@router.post("/plan", response_model=PlanResponse)
def plan_trip(request: PlanRequest):

    try:
        return generate_plan(request)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate trip plan"
        )