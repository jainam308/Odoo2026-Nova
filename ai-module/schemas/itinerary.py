from typing import List, Optional

from pydantic import BaseModel


class PlanRequest(BaseModel):
    message: str
    city: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None


class ActivitySuggestion(BaseModel):
    name: str
    estimated_cost: float
    category: str


class DayPlan(BaseModel):
    day: int
    city: str
    activities: List[ActivitySuggestion]


class PlanResponse(BaseModel):
    days: List[DayPlan]
    total_estimated_cost: float