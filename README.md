# 🧠 SkillGraph AI
**AI-powered skill gap analyzer and adaptive learning roadmap generator.**

Upload your résumé and a job description — SkillGraph AI maps your skills as a knowledge graph, identifies what's missing, and generates a personalized, sequentially correct learning path so you always learn prerequisites first.

## Features
- Multi-modal résumé parsing (PDF, DOCX, image, or paste)
- Interactive visual skill graph (known / partial / gap)
- Gap score from 0–100
- Step-by-step learning roadmap with resources, time estimates, and mini-projects
- Results in under 60 seconds

## Tech Stack
**Frontend:** React 18, Vite, TypeScript, TailwindCSS v4, React Flow, Framer Motion  
**Backend:** Node.js 24, Express 5, TypeScript, Multer, pdf-parse, mammoth, Zod  
**AI:** GPT-5.2 (JSON mode) + GPT-5.2 Vision for image résumés  
**Infra:** PostgreSQL, pnpm workspaces, OpenAPI 3.1, Orval

## How It Works
1. Your résumé and job description are parsed by GPT-5.2 into a structured skill graph
2. Missing skills are identified and arranged into a directed acyclic graph (DAG)
3. A topological sort guarantees prerequisites always come first
4. Each learning step is enriched with curated resources and a hands-on project

## Getting Started
```bash
pnpm install
pnpm dev
```
Set your `OPENAI_API_KEY` and `DATABASE_URL` in a `.env` file before running.

## License
MIT
