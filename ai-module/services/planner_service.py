import json

from schemas.itinerary import PlanRequest, PlanResponse
from services.llm_service import client
from services.fallback_service import get_fallback_plan

SYSTEM_PROMPT = """
You are the trip-planning assistant for GlobeTrotter.

Create a practical and personalized travel itinerary based on the user's request.

Follow these rules:
- Respect the requested number of days.
- Respect the provided city when one is given.
- Respect the user's budget when one is provided.
- Treat the provided budget as the maximum amount the user is willing to spend.
- Never exceed the provided budget.
- Do not artificially increase costs just to use the entire budget.
- If the budget is unrealistically low, prioritize free or low-cost activities.
- Suggest realistic activities.
- estimated_cost must be a numeric value in Indian Rupees.
- Consider whether the requested trip is realistically possible within the provided budget.
- If the budget is clearly insufficient for the requested trip, do not pretend that the trip can realistically be completed within that budget.
- In such cases, return a minimal itinerary using realistic costs and set total_estimated_cost to the realistic estimated cost, even if it exceeds the user's budget.
- category must be exactly one of:
  sightseeing
  food
  adventure
  nightlife
  culture
- Return only the requested JSON structure.
"""


def generate_plan(request: PlanRequest) -> PlanResponse:

    try:

        user_prompt = f"""
User request:
{request.message}

Trip context:
City: {request.city}
Start date: {request.start_date}
End date: {request.end_date}
Budget: {request.budget}
"""

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",

            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],

            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "trip_plan",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "days": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "day": {
                                            "type": "integer"
                                        },
                                        "city": {
                                            "type": "string"
                                        },
                                        "activities": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "name": {
                                                        "type": "string"
                                                    },
                                                    "estimated_cost": {
                                                        "type": "number"
                                                    },
                                                    "category": {
                                                        "type": "string"
                                                    }
                                                },
                                                "required": [
                                                    "name",
                                                    "estimated_cost",
                                                    "category"
                                                ],
                                                "additionalProperties": False
                                            }
                                        }
                                    },
                                    "required": [
                                        "day",
                                        "city",
                                        "activities"
                                    ],
                                    "additionalProperties": False
                                }
                            },
                            "total_estimated_cost": {
                                "type": "number"
                            }
                        },
                        "required": [
                            "days",
                            "total_estimated_cost"
                        ],
                        "additionalProperties": False
                    }
                }
            },

            include_reasoning=False,

            # Prevent the demo from hanging if Groq is unavailable
            timeout=5
        )

        content = response.choices[0].message.content

        if not content:
            raise ValueError("LLM returned an empty response")

        data = json.loads(content)

        # Validate the LLM response against our Pydantic model
        plan = PlanResponse.model_validate(data)

        return plan

    except Exception as e:

        print(f"AI planning failed: {e}")
        print("Using fallback itinerary.")

        return get_fallback_plan(request.message)