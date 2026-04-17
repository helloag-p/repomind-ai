<div align="center">

<br />

```
██████╗ ███████╗██████╗  ██████╗ ███╗   ███╗██╗███╗   ██╗██████╗      █████╗ ██╗
██╔══██╗██╔════╝██╔══██╗██╔═══██╗████╗ ████║██║████╗  ██║██╔══██╗    ██╔══██╗██║
██████╔╝█████╗  ██████╔╝██║   ██║██╔████╔██║██║██╔██╗ ██║██║  ██║    ███████║██║
██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║██║╚██╔╝██║██║██║╚██╗██║██║  ██║    ██╔══██║██║
██║  ██║███████╗██║     ╚██████╔╝██║ ╚═╝ ██║██║██║ ╚████║██████╔╝    ██║  ██║██║
╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝     ╚═╝  ╚═╝╚═╝
```

### 🧠 AI-Powered GitHub Repository Analyzer

**Understand any GitHub repository instantly — powered by LLMs, RAG & Vector Search.**

<br />

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br />

[✨ Features](#-features) · [🏗️ Architecture](#️-architecture) · [🚀 Getting Started](#-getting-started) · [📡 API Reference](#-api-reference) · [🤝 Contributing](#-contributing)

<br />

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔍 Repository Analysis
- **Project Overview** — Instant summary of what a repo does
- **Tech Stack Detection** — Auto-detect languages, frameworks & tools
- **Architecture Understanding** — Map out how components connect
- **Key Modules Identification** — Spotlight the most critical parts
- **Improvement Suggestions** — AI-generated recommendations

</td>
<td width="50%">

### 🤖 Repo Chat (RAG Powered)
- **Ask Anything** — Natural language Q&A about any repo
- **Context-Aware** — Answers grounded in actual source code
- **Source-Based** — Responses cite relevant files & modules

</td>
</tr>
<tr>
<td width="50%">

### 📊 Repo Score
- **Automated Quality Scoring** — 10-point scoring rubric
- **README & Docs Evaluation** — Check completeness & clarity
- **Project Maturity Assessment** — CI/CD, tests, structure & more

</td>
<td width="50%">

### ⚡ Performance & Reliability
- **Smart Caching** — Commit-based cache invalidation
- **Persistent Index System** — Auto-rebuild on new commits
- **Production-Safe** — No local file dependency for vector search

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User / Browser                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│             Frontend  (Next.js + Vercel)                 │
│         Tailwind CSS · ShadCN UI · Axios                 │
└───────────────────────┬─────────────────────────────────┘
                        │  REST API calls
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Backend  (FastAPI + Render)                 │
│                                                           │
│   ┌─────────────┐   ┌──────────────┐  ┌──────────────┐  │
│   │   Routes    │──▶│   Services   │─▶│    Models    │  │
│   │  /analyze   │   │  GitHub API  │  │  SQLAlchemy  │  │
│   │  /chat      │   │  RAG Engine  │  │  ORM Layer   │  │
│   └─────────────┘   └──────┬───────┘  └──────────────┘  │
│                             │                             │
│                    ┌────────▼────────┐                   │
│                    │  FAISS + MiniLM │                   │
│                    │  Vector Index   │                   │
│                    └────────┬────────┘                   │
└─────────────────────────────┼───────────────────────────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │    Neon DB   │ │  Gemini API  │ │  GitHub API  │
     │  PostgreSQL  │ │  LLM & Chat  │ │  Repo Fetch  │
     └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, Tailwind CSS, ShadCN UI, Axios |
| **Backend** | FastAPI, SQLAlchemy, Python |
| **AI / ML** | Google Gemini API, RAG, FAISS, Sentence Transformers (MiniLM) |
| **Database** | Neon PostgreSQL |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 📊 Repo Scoring System

RepoMind AI automatically evaluates repositories across **8 quality criteria**, producing a score out of 10:

| Criteria | Points | What's Checked |
|---|:---:|---|
| 📄 README | +2 | Presence, length & quality |
| 📜 License | +1 | Open-source license file |
| 🧪 Tests | +1 | Test directories or files |
| 📚 Docs | +1 | Documentation folder or files |
| ⚙️ CI/CD | +1 | GitHub Actions / workflow configs |
| 🗂️ Structure | +2 | Logical folder & module organization |
| 🌐 Languages | +1 | Multi-language or ecosystem diversity |
| 📦 Commits | +1 | Activity & commit history |
| | **Max: 10** | |

---

## 🚀 Getting Started

### Prerequisites

- Python **3.9+**
- Node.js **18+**
- A [Neon PostgreSQL](https://neon.tech/) database
- A [Google Gemini API](https://aistudio.google.com/app/apikey) key

---

### 1. Clone the Repository

```bash
git clone https://github.com/helloag-p/repomind-ai.git
cd repomind-ai
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:

```env
DATABASE_URL=your_neon_postgresql_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend server:

```bash
python run.py
```

> Backend runs at **http://127.0.0.1:8000**

---

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> Frontend runs at **http://localhost:3000**

---

## 📡 API Reference

### `GET /analyze` — Analyze a Repository

Fetches and analyzes a GitHub repository: overview, tech stack, architecture, modules, and score.

```http
GET /analyze?repo_url=https://github.com/microsoft/generative-ai-for-beginners
```

**Response:**
```json
{
  "overview": "A comprehensive course for beginners to learn Generative AI...",
  "tech_stack": ["Python", "Jupyter Notebooks", "Azure OpenAI"],
  "architecture": "Modular lesson-based structure with 18 chapters...",
  "key_modules": ["01-introduction", "06-text-generation-apps", ...],
  "improvements": ["Add unit tests", "Include a contribution guide", ...],
  "score": 9
}
```

---

### `GET /chat` — Chat With a Repository

Ask any natural language question about a repository. Powered by RAG — answers are grounded in the actual codebase.

```http
GET /chat?repo_url=https://github.com/microsoft/generative-ai-for-beginners&question=What is this repo about?
```

**Response:**
```json
{
  "answer": "This repository is a 18-lesson course teaching Generative AI concepts...",
  "sources": ["README.md", "01-introduction/README.md"]
}
```

---

## 📁 Project Structure

```
repomind-ai/
├── backend/
│   ├── app/
│   │   ├── routes/         # FastAPI route handlers (/analyze, /chat)
│   │   ├── services/       # Business logic (GitHub fetch, RAG, scoring)
│   │   ├── models/         # SQLAlchemy DB models
│   │   └── main.py         # FastAPI app entry point
│   ├── run.py              # Server runner
│   └── requirements.txt
│
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # ShadCN + custom UI components
│   ├── lib/                # API clients & utilities
│   └── public/
│
└── README.md
```

---

## 🧩 How It Works

```
 1. Fetch          2. Embed           3. Index          4. Analyze         5. Cache
─────────────    ───────────────    ────────────────   ─────────────    ────────────────
GitHub repo  →  Generate MiniLM →  Build FAISS    →  Gemini LLM   →  Store in Neon
structure &      sentence           vector index       synthesizes        with commit
file contents    embeddings         from embeddings    insights           hash as key
```

On repeated queries for the **same commit**, results are served instantly from cache — no redundant LLM calls.

---

## 🚀 Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com/) | Auto-deploy from `main` branch |
| Backend | [Railway](https://railway.app/) / [Render](https://render.com/) | Set env vars in dashboard |
| Database | [Neon PostgreSQL](https://neon.tech/) | Free tier available |

---

## 🔮 Roadmap

- [ ] 🔁 **Repo Comparison** — Compare two repos side by side
- [ ] 🔎 **PR Review AI** — Automated pull request analysis
- [ ] 🔐 **GitHub OAuth** — Authenticate to access private repos
- [ ] 📈 **Repo Visualization** — Interactive dependency & architecture graphs
- [ ] 💡 **Improvement Suggestions v2** — Actionable, file-level recommendations

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Parv Agarwal](https://github.com/helloag-p)**

[![GitHub](https://img.shields.io/badge/GitHub-helloag--p-181717?style=flat-square&logo=github)](https://github.com/helloag-p)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Parv_Agarwal-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/parv-agarwal-09b042215)

<br />

*If you found this project helpful, consider giving it a ⭐*

</div>