from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import research_router, references_router
from app.db.session import engine
from app.db.base import Base
from app.database import create_tables

# Create database tables
Base.metadata.create_all(bind=engine)
create_tables()  # Создаем таблицы явно

app = FastAPI(
    title="AI Research API",
    description="API for collecting and analyzing IT technologies, particularly AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене нужно указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type"]  # Важно для скачивания файлов
)

# Include routers
app.include_router(research_router)
app.include_router(references_router)

@app.get("/")
async def root():
    return {"message": "Welcome to AI Research API"} 