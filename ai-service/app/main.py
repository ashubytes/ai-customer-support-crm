from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.ai import router as ai_router

app = FastAPI(
    title="Customer Support & CRM AI Microservice",
    description="AI service powering ticket triage, sentiment analysis, and smart replies using Google Gemini API",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(ai_router)


@app.get("/")
async def root():
    return {
        "message": "AI-Powered Customer Support & CRM Microservice",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
