from ..models import RepoIndex
from ..database import SessionLocal
from ..services.github_service import get_latest_commit_sha, get_repo_context
from ..services.gemini_service import analyze_repo
from ..services.scoring_service import compute_repo_score
from fastapi import APIRouter
import json
router = APIRouter()

@router.get("/analyze")
def analyze(repo_url: str):

    db = SessionLocal()

    parts = repo_url.strip("/").split("/")
    owner = parts[-2]
    repo = parts[-1]

    latest_sha = get_latest_commit_sha(owner, repo)

    record = db.query(RepoIndex).filter(
        RepoIndex.repo_url == repo_url
    ).first()

    # Use cached result
    if record and record.last_commit_sha == latest_sha:
        print("Using cached analysis")

        return {
            "analysis": json.loads(record.analysis),
            "score": {"repo_score": record.repo_score}
        }

    # else call gemini
    print("Calling Gemini for analysis...")

    context = get_repo_context(repo_url)
    analysis = analyze_repo(context)
    score = compute_repo_score(context)

    if record is None:
        record = RepoIndex(
            repo_url=repo_url,
            last_commit_sha=latest_sha,
            analysis=json.dumps(analysis),
            repo_score=score["repo_score"]
        )
        db.add(record)

    else:
        record.last_commit_sha = latest_sha
        record.analysis = json.dumps(analysis)
        record.repo_score = score["repo_score"]

    db.commit()

    return {
        "analysis": analysis,
        "score": score
    }