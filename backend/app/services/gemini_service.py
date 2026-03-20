import json
import re
import google.generativeai as genai
from ..config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def clean_json_response(text: str):
    """
    Remove markdown code blocks from LLM output
    """
    text = text.strip()

    # remove ```json ... ``` wrappers
    text = re.sub(r"^```json", "", text)
    text = re.sub(r"```$", "", text)

    return text.strip()


def analyze_repo(context):

    prompt = f"""
You are a senior software architect.

Analyze the following GitHub repository and return ONLY valid JSON.

Repository Context:

FILES:
{context["files"]}

LANGUAGES:
{context["languages"]}

FOLDER STRUCTURE:
{context["tree"]}

README:
{context["readme"]}

Return JSON exactly like this format:

{{
 "project_type": "",
 "framework": "",
 "languages": [],
 "architecture": "",
 "key_modules": [],
 "improvements": []
}}
"""

    response = model.generate_content(prompt)

    text = clean_json_response(response.text)

    try:
        return json.loads(text)
    except Exception:
        return {"error": "LLM returned invalid JSON", "raw_output": text}