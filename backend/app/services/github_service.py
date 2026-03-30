import requests
import os


def parse_repo_url(repo_url: str):
    parts = repo_url.strip("/").split("/")
    owner = parts[-2]
    repo = parts[-1]
    return owner, repo


def get_repo_files(owner, repo):

    url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    
    headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "RepoMind-AI",
    "Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"
    }

    response = requests.get(url, headers=headers, timeout=15)

    if response.status_code != 200:
        return []

    data = response.json()

    files = []

    for item in data:
        files.append(item["name"])

    return files


def get_repo_readme(owner, repo):

    url = f"https://api.github.com/repos/{owner}/{repo}/readme"

    headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "RepoMind-AI",
    "Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"
    }

    response = requests.get(url, headers=headers, timeout=15)

    if response.status_code != 200:
        return ""

    return response.text[:4000]


def get_repo_languages(owner, repo):

    url = f"https://api.github.com/repos/{owner}/{repo}/languages"

    headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "RepoMind-AI",
    "Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"
    }

    response = requests.get(url, headers=headers, timeout=15)


    if response.status_code != 200:
        return {}

    return response.json()


def get_repo_tree(owner, repo):

    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"

    headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "RepoMind-AI",
    "Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"
    }

    response = requests.get(url, headers=headers, timeout=15)

    if response.status_code != 200:
        return []

    data = response.json()

    tree = []

    for item in data.get("tree", [])[:50]:   # limit to avoid huge prompts
        tree.append(item["path"])

    return tree


def get_repo_context(repo_url):

    owner, repo = parse_repo_url(repo_url)

    files = get_repo_files(owner, repo)

    readme = get_repo_readme(owner, repo)

    languages = get_repo_languages(owner, repo)

    tree = get_repo_tree(owner, repo)

    return {
        "files": files,
        "readme": readme,
        "languages": languages,
        "tree": tree
    }

def get_latest_commit_sha(owner, repo):

    url = f"https://api.github.com/repos/{owner}/{repo}/commits"

    headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "RepoMind-AI",
    "Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"
    }

    response = requests.get(url, headers=headers, timeout=15)


    if response.status_code != 200:
        return None

    data = response.json()

    if len(data) == 0:
        return None

    return data[0]["sha"]