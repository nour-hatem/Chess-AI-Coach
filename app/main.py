from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.api.routes import games


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Personal AI Chess Coach",
    version="1.0.0",
    description="Backend API for chess game analysis, blunder detection, and player reports.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games.router, prefix="/api/v1/games", tags=["Games"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "API is running"}
