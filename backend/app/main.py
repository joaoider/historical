from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router


app = FastAPI(
    title="IDER API",
    description="API educacional de ideias, descobertas, evoluções e raízes",
    version="1.0.0"
)

# Configurar CORS para aceitar requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def home():

    return {
        "message": "Bem-vindo ao IDER!",
        "version": "1.0.0",
        "docs": "/docs"
    }
