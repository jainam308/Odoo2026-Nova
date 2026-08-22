from schemas.itinerary import PlanResponse


GOA_FALLBACK = {
    "days": [
        {
            "day": 1,
            "city": "Goa",
            "activities": [
                {
                    "name": "Baga Beach",
                    "estimated_cost": 0,
                    "category": "sightseeing"
                },
                {
                    "name": "Goan Seafood Dinner",
                    "estimated_cost": 500,
                    "category": "food"
                }
            ]
        },
        {
            "day": 2,
            "city": "Goa",
            "activities": [
                {
                    "name": "Basilica of Bom Jesus",
                    "estimated_cost": 0,
                    "category": "culture"
                },
                {
                    "name": "Calangute Beach",
                    "estimated_cost": 0,
                    "category": "sightseeing"
                }
            ]
        },
        {
            "day": 3,
            "city": "Goa",
            "activities": [
                {
                    "name": "Anjuna Beach",
                    "estimated_cost": 0,
                    "category": "sightseeing"
                },
                {
                    "name": "Goa Nightlife Experience",
                    "estimated_cost": 1000,
                    "category": "nightlife"
                }
            ]
        }
    ],
    "total_estimated_cost": 1500
}


JAIPUR_FALLBACK = {
    "days": [
        {
            "day": 1,
            "city": "Jaipur",
            "activities": [
                {
                    "name": "Amber Fort",
                    "estimated_cost": 500,
                    "category": "culture"
                },
                {
                    "name": "Jal Mahal",
                    "estimated_cost": 0,
                    "category": "sightseeing"
                }
            ]
        },
        {
            "day": 2,
            "city": "Jaipur",
            "activities": [
                {
                    "name": "City Palace",
                    "estimated_cost": 500,
                    "category": "culture"
                },
                {
                    "name": "Local Food Tour",
                    "estimated_cost": 500,
                    "category": "food"
                }
            ]
        },
        {
            "day": 3,
            "city": "Jaipur",
            "activities": [
                {
                    "name": "Hawa Mahal",
                    "estimated_cost": 200,
                    "category": "sightseeing"
                },
                {
                    "name": "Johari Bazaar",
                    "estimated_cost": 0,
                    "category": "shopping"
                }
            ]
        }
    ],
    "total_estimated_cost": 2200
}


def get_fallback_plan(message: str) -> PlanResponse:
    message_lower = message.lower()

    if "goa" in message_lower:
        return PlanResponse(**GOA_FALLBACK)

    if "jaipur" in message_lower:
        return PlanResponse(**JAIPUR_FALLBACK)

    # Generic fallback
    return PlanResponse(
        days=[
            {
                "day": 1,
                "city": "Delhi",
                "activities": [
                    {
                        "name": "India Gate",
                        "estimated_cost": 0,
                        "category": "sightseeing"
                    },
                    {
                        "name": "Local Food Experience",
                        "estimated_cost": 500,
                        "category": "food"
                    }
                ]
            },
            {
                "day": 2,
                "city": "Delhi",
                "activities": [
                    {
                        "name": "Red Fort",
                        "estimated_cost": 500,
                        "category": "culture"
                    },
                    {
                        "name": "Humayun's Tomb",
                        "estimated_cost": 300,
                        "category": "culture"
                    }
                ]
            },
            {
                "day": 3,
                "city": "Delhi",
                "activities": [
                    {
                        "name": "Qutub Minar",
                        "estimated_cost": 300,
                        "category": "sightseeing"
                    }
                ]
            }
        ],
        total_estimated_cost=1600
    )
    