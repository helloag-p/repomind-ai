from fastapi import FastAPI
from .database import engine
from .models import Base
from .routes import analyze, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GitHub AI Analyzer")

app.include_router(analyze.router)
app.include_router(chat.router)
