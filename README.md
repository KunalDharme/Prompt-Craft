# Prompt-Craft

**Human ideas → structured AI prompts**

A full-stack AI tool that converts plain-language ideas into professional, structured prompts — tailored to your profession, preferred format, and output length.

---

## What it does

Most people know what they want but struggle to write a good AI prompt. Prompt-Craft bridges that gap. You describe your idea in plain language, pick a structure and style, and the app generates a clean, ready-to-use prompt you can copy or export.

---

## Features

- **5 prompt structures**
- **Custom structure builder**
- **5 length & style modes** — Short, Medium, Long, Bullet-only, Paragraph-style
- **Profession context** — tell the app who you are (e.g. "Web Developer", "Filmmaker") so prompts match your background
- **Prompt history**
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

### One-time setup

Clone the repo, then run the setup script for your OS. It handles everything — checks Ollama, pulls phi3, creates a Python virtual environment, installs all dependencies, and installs frontend packages.

**Mac / Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```
Double-click setup.bat  (or run it in Command Prompt)
```

> **Ollama must be installed before running the script.**
> The script will tell you if it's missing and give you the download link.
> → https://ollama.com/download

---

### Starting the app (after setup)

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate        # Windows: venv\Scripts\activate
uvicorn main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open → `http://localhost:3000`

> **Note:** The frontend is also deployed at [https://prompt-craft-gamma-five.vercel.app/] but requires the backend and Ollama running locally to generate prompts.

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
This project is licensed under the MIT License.

## Author
Developed by Kunal Dharme.
