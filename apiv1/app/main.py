from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_jwt_auth import AuthJWT

from app.core.config import settings
from app.core.database import postgres  # postgres = PostgreSQL()

# Import routers (converted from Blueprints)
from app.routes import (
    users,
    db,
    bookmarks,
    general,
    google,
    dropbox,
    microsoft,
    settings_route,
    family,
    notes,
    dashboard,
    planner,
    notifications,
    home,
    files,
)


def create_app() -> FastAPI:
    app = FastAPI(title="My FastAPI App")

    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.WEB_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # JWT Config
    @AuthJWT.load_config
    def get_config():
        return settings  # settings contains `authjwt_secret_key`

    # ✅ Initialize Postgres when app starts
    @app.on_event("startup")
    def startup_event():
        postgres.init_app()

    # ✅ Close Postgres pool when app shuts down
    @app.on_event("shutdown")
    def shutdown_event():
        postgres.close_all_connections()

    # ✅ Register routers
    app.include_router(users.router, prefix="/server/api")
    app.include_router(db.router, prefix="/server/api")
    app.include_router(bookmarks.router, prefix="/server/api")
    app.include_router(general.router, prefix="/server/api")
    app.include_router(google.router, prefix="/server/api")
    app.include_router(dropbox.router, prefix="/server/api")
    app.include_router(microsoft.router, prefix="/server/api")
    app.include_router(settings_route.router, prefix="/server/api")
    app.include_router(family.router, prefix="/server/api")
    app.include_router(notes.router, prefix="/server/api")
    app.include_router(dashboard.router, prefix="/server/api")
    app.include_router(planner.router, prefix="/server/api")
    app.include_router(notifications.router, prefix="/server/api")
    app.include_router(home.router, prefix="/server/api")
    app.include_router(files.router, prefix="/server/api")

    return app


# ✅ Global app instance
app = create_app()
