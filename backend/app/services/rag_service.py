import requests
import faiss
import numpy as np
import os 
import pickle
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import json
from ..services.github_service import get_latest_commit_sha
from ..config import GEMINI_API_KEY
from ..database import SessionLocal
from ..models import RepoIndex
from datetime import datetime

genai.configure(api_key=GEMINI_API_KEY)

model = SentenceTransformer("all-MiniLM-L6-v2")
gemini = genai.GenerativeModel("gemini-2.5-flash")


def fetch_repo_files(owner, repo):

    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"

    r = requests.get(url)

    files = []

    for item in r.json().get("tree", []):
        if item["path"].endswith((".py", ".js", ".ts", ".tsx", ".jsx", ".md", ".json", ".yaml", ".yml")):
             files.append(item["path"])
             
    return files[:20]  # limit to 20 files for LLM context


def fetch_file_content(owner, repo, path):

    url = f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{path}"

    try:
        r = requests.get(url, timeout=10)

        if r.status_code != 200:
            return ""

        return r.text[:1500]

    except:
        return ""
    

def build_index(text_chunks):

    embeddings = model.encode(text_chunks)

    dim = embeddings.shape[1]

    index = faiss.IndexFlatL2(dim)

    index.add(np.array(embeddings))

    return index, embeddings

def get_latest_commit_sha(owner, repo):

    url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=1"

    try:
        r = requests.get(url, timeout=10)

        if r.status_code != 200:
            return None

        data = r.json()

        return data[0]["sha"]

    except:
        return None

def chat_with_repo(repo_url, question):

    db = SessionLocal()

    parts = repo_url.strip("/").split("/")
    owner = parts[-2]
    repo = parts[-1]

    latest_sha = get_latest_commit_sha(owner, repo)

    record = db.query(RepoIndex).filter(
        RepoIndex.repo_url == repo_url
    ).first()

    # rebuild condition
    rebuild = False

    if record is None:
        rebuild = True
        print("No record found → rebuild")

    elif record.last_commit_sha != latest_sha:
        rebuild = True
        print("Commit changed → rebuild")

    else:
        print("Using cached metadata")

    # rebuild index
    if rebuild:

        files = fetch_repo_files(owner, repo)

        chunks = []

        for file in files:
            text = fetch_file_content(owner, repo, file)
            chunks.append(f"{file}\n{text}")

        index, embeddings = build_index(chunks)

        # store metadata only
        if record is None:

            record = RepoIndex(
                repo_url=repo_url,
                last_commit_sha=latest_sha,
                indexed_files=json.dumps(files)
            )

            db.add(record)

        else:

            record.last_commit_sha = latest_sha
            record.indexed_files = json.dumps(files)

        db.commit()

    else:

        files = json.loads(record.indexed_files)

        chunks = []

        for file in files:
            text = fetch_file_content(owner, repo, file)
            chunks.append(f"{file}\n{text}")

        index, embeddings = build_index(chunks)

    # Search

    q_embedding = model.encode([question])

    D, I = index.search(np.array(q_embedding), k=3)

    context = "\n\n".join([chunks[i] for i in I[0]])

    prompt = f"""
You are an expert senior software engineer.

Analyze the repository and answer clearly.

RULES:
- Use proper formatting (headings, bullet points)
- Be concise but informative
- Avoid raw markdown symbols like ** if not needed
- Structure answer like a professional report

CODE:
{context}

QUESTION:
{question}
"""

    response = gemini.generate_content(prompt)

    return {
        "question": question,
        "answer": response.text,
        "sources": [files[i] for i in I[0]]
    }

# def chat_with_repo(repo_url, question):
#     db = SessionLocal()
#     parts = repo_url.strip("/").split("/")

#     owner = parts[-2]
#     repo = parts[-1]
#     latest_sha = get_latest_commit_sha(owner, repo)
    
#     record = db.query(RepoIndex).filter(
#         RepoIndex.repo_url == repo_url
#     ).first()

#     index_path = f"vector_store/{owner}_{repo}.index"
#     chunks_path = f"vector_store/{owner}_{repo}_chunks.pkl"
#     rebuild = False
#     if record is None:
#         print("No record found → rebuild")
#         rebuild = True

#     elif latest_sha is None:
#         print("SHA fetch failed → rebuild")
#         rebuild = True

#     elif record.last_commit_sha != latest_sha:
#         print("Commit changed → rebuild")
#         rebuild = True

#     elif not os.path.exists(index_path):
#         print("Index file missing → rebuild")
#         rebuild = True

#     else:
#         print("No change → load index")
#     # if index already exists → load it
#     print("------ DEBUG ------")
#     print("Repo URL:", repo_url)
#     print("Latest SHA:", latest_sha)
#     print("DB SHA:", record.last_commit_sha if record else None)
#     print("Index exists:", os.path.exists(index_path))
#     if not rebuild:
#         print("Loading existing index...")
#         index = faiss.read_index(index_path)

#         with open(chunks_path, "rb") as f:
#             chunks = pickle.load(f)

#     else:
#         print("Rebuilding index")
#         files = fetch_repo_files(owner, repo)

#         chunks = []

#         for file in files:
#             text = fetch_file_content(owner, repo, file)

#             if text:
#                 chunks.append({
#                     "file": file,
#                     "content": text
#                 })

#         index, embeddings = build_index([
#             f"{c['file']}\n{c['content']}" for c in chunks
#         ])
#         faiss.write_index(index, index_path)

#         with open(chunks_path, "wb") as f:
#             pickle.dump(chunks, f)
#         # update db
#         if record is None:
#             record = RepoIndex(
#                 repo_url=repo_url,
#                 last_commit_sha=latest_sha,
#             )
#             db.add(record)
#         else:
#             record.last_commit_sha = latest_sha
#             record.last_indexed_at = datetime.utcnow()
#         db.commit()

#     q_embedding = model.encode([question])
#     D, I = index.search(np.array(q_embedding), k=3)
#     context = "\n\n".join([
#         f"{chunks[i]['file']}\n{chunks[i]['content']}"
#         for i in I[0]
#     ])[:6000]
#     prompt = f"""
# You are an expert software engineer.

# Analyze the repository and answer clearly.

# RULES:
# - Use proper formatting (headings, bullet points)
# - Be concise but informative
# - Avoid raw markdown symbols like ** if not needed
# - Structure answer like a professional report

# CODE CONTEXT:
# {context}

# QUESTION:
# {question}

# Answer clearly.  
# """

#     response = gemini.generate_content(prompt)

#     return {
#         "question": question,
#         "answer": response.text,
#         "sources": [chunks[i]["file"] for i in I[0]]
#     }