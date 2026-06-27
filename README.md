# Prompt-Craft

**Human ideas → structured AI prompts**

A full-stack AI tool that converts plain-language ideas into professional, structured prompts — tailored to your profession, preferred format, and output length.

---

## What it does

Most people know what they want but struggle to write a good AI prompt. PromptCraft bridges that gap. You describe your idea in plain language, pick a structure and style, and the app generates a clean, ready-to-use prompt you can copy or export.

---

## Features

- **5 prompt structures** — Role+Goal, Task+Context, Persona+Scenario, System+User, Chain of Thought
- **Custom structure builder** — pick 4–6 sections from 18 options and build your own format
- **5 length & style modes** — Short, Medium, Long, Bullet-only, Paragraph-style
- **Profession context** — tell the app who you are (e.g. "3rd year IT student", "Filmmaker") so prompts match your background
- **Prompt history** — last 10 prompts saved locally, expandable, reloadable
- **Export as .txt** — download any prompt as a text file
- **Copy to clipboard** — one click copy on every result

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind CSS |
| Backend   | FastAPI (Python)                  |
| AI Model  | Ollama · phi3 (runs locally)      |
| Storage   | localStorage (browser)            |

---

## Getting Started

> **Prerequisite — Ollama must be installed and running locally.**
> The backend calls phi3 via Ollama on `localhost:11434`. Without it, generation won't work.
> Download Ollama → https://ollama.com/download

### 1. Pull the AI model
```bash
ollama pull phi3
```

### 2. Start the backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at `http://127.0.0.1:8000`

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:3000`

> **Note:** The frontend is also deployed at [your-vercel-url] but requires the backend and Ollama running locally to generate prompts.

---

## Project Structure

```
promptcraft/
├── frontend/
│   └── app/
│       └── page.tsx       # Main UI — all features live here
├── backend/
│   └── main.py            # FastAPI server + prompt logic
└── README.md
```

---

## How it works

1. User fills in who they are (optional), picks a prompt structure, picks a length/style, and writes their idea
2. Frontend sends a POST request to `/generate` with all options
3. Backend builds a meta-prompt — instructing phi3 exactly how to structure and size the output
4. phi3 returns a formatted prompt which is displayed, copyable, and saved to history

---

## API

`POST /generate`

```json
{
  "idea": "I want to build a task manager app",
  "profession": "Web Developer",
  "prompt_type": "task-context",
  "length_style": "medium",
  "custom_sections": []
}
```

Response:
```json
{
  "result": "TASK:\n...\nCONTEXT:\n...",
  "prompt_type_label": "Task + Context",
  "length_style_label": "Medium"
}
```

---

## License

MIT