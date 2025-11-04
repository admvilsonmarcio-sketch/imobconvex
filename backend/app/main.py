from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.init_db import init_db
from app.db.session import create_db_and_tables, engine


@asynccontextmanager
def lifespan(_: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        init_db(session)
    yield


app = FastAPI(
    title="ImobConvex API",
    description="Serviço central do sistema imobiliário inteligente.",
    version="0.2.0",
    openapi_url=f"{settings.api_v1_str}/openapi.json",
    docs_url=f"{settings.api_v1_str}/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_str)


@app.get("/health", tags=["health"])  # simple unauthenticated check
async def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
