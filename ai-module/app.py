from fastapi import FastAPI
from routes.ai_routes import router as ai_router

app = FastAPI(
    title="GlobeTrotter AI Module"
)

app.include_router(
    ai_router,
    prefix="/api/ai"
)


@app.get("/")
def root():
    return {
        "message": "GlobeTrotter AI Module is running"
    }