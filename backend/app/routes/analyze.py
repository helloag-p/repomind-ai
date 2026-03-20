from fastapi import APIRouter
from ..services.github_service import get_repo_context
from ..services.gemini_service import analyze_repo
from ..services.scoring_service import compute_repo_score

router = APIRouter()


@router.get("/analyze")
def analyze_repository(repo_url: str):

    context = get_repo_context(repo_url)

    ai_analysis = analyze_repo(context)

    score = compute_repo_score(context)

    return {
        "repo_url": repo_url,
        "score": score,
        "analysis": ai_analysis,
    }