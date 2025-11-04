from fastapi import APIRouter

router = APIRouter()


@router.get("/ping", summary="Healthcheck interno")
async def ping() -> dict[str, str]:
    return {"status": "ok"}
