from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.deals import router as deals_router
from app.api.favorites import router as favorites_router
from app.api.health import router as health_router
from app.api.menu import router as menu_router
from app.api.notifications import router as notification_router
from app.api.orders import router as orders_router
from app.api.owner import router as owner_router
from app.api.owner_insights import router as owner_insights_router
from app.api.partner_restaurants import (
    router as partner_restaurants_router,
)
from app.api.payments import router as payments_router
from app.api.recommendations import (
    router as recommendations_router,
)
from app.api.restaurants import router as restaurants_router
from app.api.search import router as search_router
from app.api.uploads import router as uploads_router
from app.core.config import settings
from app.core.database import Base, engine

import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Savora API",
    version="1.0.0",
)

configured_frontend_url = (
    settings.FRONTEND_URL.strip().rstrip("/")
    if settings.FRONTEND_URL
    else ""
)

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://campus-eats-sable.vercel.app",
    "https://savora-cvdq.onrender.com",
]

if (
    configured_frontend_url
    and configured_frontend_url not in allowed_origins
):
    allowed_origins.append(configured_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(restaurants_router)
app.include_router(menu_router)
app.include_router(deals_router)
app.include_router(search_router)
app.include_router(recommendations_router)
app.include_router(favorites_router)
app.include_router(uploads_router)
app.include_router(chat_router)
app.include_router(analytics_router)
app.include_router(partner_restaurants_router)
app.include_router(owner_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(notification_router)
app.include_router(owner_insights_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {"message": "Welcome to Savora!"}