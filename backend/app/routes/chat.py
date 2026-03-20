from fastapi import APIRouter
from ..services.rag_service import chat_with_repo

router = APIRouter()


@router.get("/chat")

def repo_chat(repo_url: str, question: str):

    result = chat_with_repo(repo_url, question)

    return result