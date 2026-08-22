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
- Suggest realistic activities.
- estimated_cost must be a numeric value in Indian Rupees.
- category must describe the activity.
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