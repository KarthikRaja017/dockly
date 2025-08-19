from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core import security, db


def create_app() -> FastAPI:
    app = FastAPI(title="My FastAPI App")

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.WEB_URL],  # or ["*"]
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Import and include all routers
    from app.routes import (
        users,
        db as db_routes,
        bookmarks,
        general,
        google,
        dropbox,
        microsoft,
        family,
        settings as settings_routes,
        notes,
        dashboard,
        planner,
        notifications,
        home,
        files,
    )

    app.include_router(users.router, prefix="/users", tags=["users"])
    app.include_router(db_routes.router, prefix="/db", tags=["db"])
    app.include_router(bookmarks.router, prefix="/bookmarks", tags=["bookmarks"])
    app.include_router(general.router, prefix="/general", tags=["general"])
    app.include_router(google.router, prefix="/google", tags=["google"])
    app.include_router(dropbox.router, prefix="/dropbox", tags=["dropbox"])
    app.include_router(microsoft.router, prefix="/microsoft", tags=["microsoft"])
    app.include_router(family.router, prefix="/family", tags=["family"])
    app.include_router(settings_routes.router, prefix="/settings", tags=["settings"])
    app.include_router(notes.router, prefix="/notes", tags=["notes"])
    app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
    app.include_router(planner.router, prefix="/planner", tags=["planner"])
    app.include_router(
        notifications.router, prefix="/notifications", tags=["notifications"]
    )
    app.include_router(home.router, prefix="/home", tags=["home"])
    app.include_router(files.router, prefix="/files", tags=["files"])

    return app


app = create_app()
