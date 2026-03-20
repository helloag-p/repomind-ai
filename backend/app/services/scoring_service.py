def compute_repo_score(context):

    score = 0

    # README present
    if context["readme"]:
        score += 2

    # languages detected
    if len(context["languages"]) > 0:
        score += 2

    # file structure depth
    if len(context["tree"]) > 20:
        score += 2

    # config files
    important = ["package.json", "requirements.txt", "Dockerfile"]
    if any(f in context["files"] for f in important):
        score += 2

    # documentation
    docs = ["README.md", "CONTRIBUTING.md"]
    if any(f in context["files"] for f in docs):
        score += 2

    return {
        "repo_score": score,
        "max_score": 10
    }