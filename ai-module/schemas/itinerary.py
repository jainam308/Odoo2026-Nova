from typing import List, Optional
from pydantic import BaseModel, field_validator



class PlanRequest(BaseModel):
    message: str
    city: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Message cannot be empty")

        return value
    
    @field_validator("budget", mode="before")
    @classmethod
    def validate_budget(cls, value):
        if value == "" or value is None:
            return None

        value = float(value)

        if value < 0:
            raise ValueError("Budget cannot be negative")

        return value

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