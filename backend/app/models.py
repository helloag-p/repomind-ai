from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from .database import Base


class RepoIndex(Base):
    __tablename__ = "repo_index"

    id = Column(Integer, primary_key=True, index=True)

    repo_url = Column(String, unique=True)

    last_commit_sha = Column(String)

    last_indexed_at = Column(DateTime, default=datetime.utcnow)

    # NEW
    analysis = Column(Text)
    repo_score = Column(Integer)
    # indexed_files = Column(Text)