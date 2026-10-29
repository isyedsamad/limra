from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import analytics, data_quality, forecasts, generation, health, overview, procurement

app = FastAPI(title="EnergyBoard API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(overview.router, prefix="/api", tags=["overview"])
app.include_router(generation.router, prefix="/api", tags=["generation"])
app.include_router(forecasts.router, prefix="/api", tags=["forecasts"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(data_quality.router, prefix="/api", tags=["data-quality"])
app.include_router(procurement.router, prefix="/api", tags=["procurement"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)