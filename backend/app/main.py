from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import analytics, data_quality, forecasts, generation, health, overview, procurement

app = FastAPI(title="EnergyBoard API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

routers = [health.router, overview.router, generation.router, forecasts.router, analytics.router, data_quality.router, procurement.router]
for prefix in ["/api", ""]:
    for r in routers:
        app.include_router(r, prefix=prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)