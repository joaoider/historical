import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router
from .database import initialize_database


app = FastAPI(
    title="IDER API",
    description="API educacional de ideias, descobertas, evoluções e raízes",
    version="1.0.0"
)

# Configurar CORS para aceitar requisições do frontend
default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
configured_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(default_origins + configured_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
def create_mvp_progress_table():
    initialize_database()


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}


@app.get("/")
def home():

    return {
        "message": "Bem-vindo ao IDER!",
        "version": "1.0.0",
        "docs": "/docs"
    }
