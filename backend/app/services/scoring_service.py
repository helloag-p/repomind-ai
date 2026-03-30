def compute_repo_score(context):

    score = 0

    files = context.get("files", [])

    if "README.md" in [f.lower() for f in files]:
        score += 2

    if "LICENSE" in [f.upper() for f in files]:
        score += 1

    if any("test" in f.lower() for f in files):
        score += 1

    if ".github" in files:
        score += 1

    if "docs" in files:
        score += 1

    if len(files) > 10:
        score += 1

    if len(context.get("languages", {})) > 1:
        score += 1

    if len(context.get("tree", [])) > 20:
        score += 2

    return {
        "repo_score": min(score, 10)
    }