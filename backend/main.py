from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests


# ----------------------------------
# App Setup
# ----------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------
# Request Schema
# ----------------------------------

class PromptRequest(BaseModel):
    idea: str
    profession: str = ""          # optional — e.g. "3rd year IT student", "Filmmaker"
    prompt_type: str = "role-goal"
    length_style: str = "medium"  # short | medium | long | bullet-only | paragraph
    custom_sections: list[str] = []


# ----------------------------------
# Prompt Type Structures
# ----------------------------------

PROMPT_STRUCTURES = {
    "role-goal": {
        "label": "Role + Goal",
        "description": "Classic structure with ROLE, GOAL, INSTRUCTIONS, OUTPUT",
        "format": """
ROLE:
(one line — who the AI should act as)

GOAL:
(what needs to be achieved)

INSTRUCTIONS:
- step 1
- step 2
- step 3

OUTPUT:
(expected result)
"""
    },
    "task-context": {
        "label": "Task + Context",
        "description": "Focuses on TASK, CONTEXT, CONSTRAINTS, DELIVERABLE",
        "format": """
TASK:
(one line — the core action to perform)

CONTEXT:
(background info the AI needs)

CONSTRAINTS:
- constraint 1
- constraint 2
- constraint 3

DELIVERABLE:
(what the final output should look like)
"""
    },
    "persona-scenario": {
        "label": "Persona + Scenario",
        "description": "Best for creative or storytelling prompts",
        "format": """
PERSONA:
(one line — character or identity the AI assumes)

SCENARIO:
(the situation or world context)

BEHAVIOR:
- how to act 1
- how to act 2
- how to act 3

RESPONSE STYLE:
(tone, format, and length of response)
"""
    },
    "system-user": {
        "label": "System + User",
        "description": "Mirrors how ChatGPT/Claude system prompts are structured",
        "format": """
SYSTEM PROMPT:
(sets the AI's overall behavior and identity)

USER MESSAGE:
(the exact message a user would send)

EXPECTED BEHAVIOR:
- behavior 1
- behavior 2
- behavior 3

SUCCESS CRITERIA:
(what a good response looks like)
"""
    },
    "chain-of-thought": {
        "label": "Chain of Thought",
        "description": "For reasoning-heavy or analytical prompts",
        "format": """
OBJECTIVE:
(one line — what needs to be reasoned through)

THINK STEP BY STEP:
- step 1: what to analyze first
- step 2: what to consider next
- step 3: how to reach conclusion

REASONING STYLE:
(how to approach the problem)

FINAL ANSWER FORMAT:
(how the conclusion should be presented)
"""
    }
}


# ----------------------------------
# Length / Style Instructions
# ----------------------------------

LENGTH_STYLE_RULES = {
    "short": {
        "label": "Short",
        "rule": "Keep the entire prompt under 80 words. Every section must be 1 line only — no extra detail. Be terse and minimal."
    },
    "medium": {
        "label": "Medium",
        "rule": "Keep the entire prompt between 150–250 words. Mix brief paragraphs and bullet points naturally. This is the balanced default."
    },
    "long": {
        "label": "Long",
        "rule": "Write a detailed prompt of 300+ words. Expand every section with context, nuance, and specific guidance. More depth is better."
    },
    "bullet-only": {
        "label": "Bullet-only",
        "rule": "Use ONLY bullet points throughout — no paragraphs at all. Every piece of information must be a bullet point, even in sections that normally have prose."
    },
    "paragraph": {
        "label": "Paragraph-style",
        "rule": "Write in flowing paragraph form only — no bullet points or dashes anywhere. Every section should read as natural prose sentences."
    }
}


# ----------------------------------
# Health Check
# ----------------------------------

@app.get("/")
def home():
    return {"status": "running"}


# ----------------------------------
# Get Prompt Types
# ----------------------------------

@app.get("/prompt-types")
def get_prompt_types():
    return {
        key: {
            "label": val["label"],
            "description": val["description"]
        }
        for key, val in PROMPT_STRUCTURES.items()
    }


# ----------------------------------
# Generate Prompt
# ----------------------------------

@app.post("/generate")
def generate(data: PromptRequest):
    structure = PROMPT_STRUCTURES.get(data.prompt_type, PROMPT_STRUCTURES["role-goal"])

    # Override with user-built custom structure
    if data.prompt_type == "custom" and data.custom_sections:
        custom_format = "\n".join(
            f"{section}:\n(fill in based on the idea)\n"
            for section in data.custom_sections
        )
        structure = {
            "label": " · ".join(data.custom_sections),
            "format": custom_format,
        }

    length_style = LENGTH_STYLE_RULES.get(data.length_style, LENGTH_STYLE_RULES["medium"])

    profession_context = (
        f"\nUSER PROFESSION / BACKGROUND:\n{data.profession}\n"
        f"Important: tailor the prompt's language, assumptions, and depth to suit someone with this background.\n"
        if data.profession.strip() else ""
    )

    prompt = f"""
You are Prompt-Craft, an expert at converting human ideas into precise AI prompts.

Convert the user's idea into a prompt using EXACTLY this structure:
{structure["format"]}

LENGTH & STYLE RULE (follow this strictly):
{length_style["rule"]}
{profession_context}
Additional rules:
- No explanations or meta-commentary before or after
- No markdown formatting or backticks
- Fill every section with real, useful content based on the idea
- Return only the structured prompt, nothing else

USER IDEA:
{data.idea}
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "phi3",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3
            }
        }
    )

    generated_prompt = response.json()["response"]

    return {
        "result": generated_prompt,
        "prompt_type": data.prompt_type,
        "prompt_type_label": structure["label"],
        "length_style": data.length_style,
        "length_style_label": length_style["label"]
    }