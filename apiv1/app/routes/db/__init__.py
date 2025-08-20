from fastapi import APIRouter
from . import routes

db_router = APIRouter()
db_router.include_router(routes.router)
