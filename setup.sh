#!/bin/bash

# ─────────────────────────────────────────
#  PromptCraft — Setup Script (Mac / Linux)
# ─────────────────────────────────────────

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║       PromptCraft Setup              ║"
echo "║       Mac / Linux                    ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Step 1: Check Ollama ──────────────────
echo "▸ Checking Ollama..."

if command -v ollama &> /dev/null; then
    echo "  ✓ Ollama is already installed"
else
    echo ""
    echo "  ✗ Ollama is not installed."
    echo ""
    echo "  Please install it manually:"
    echo "  → https://ollama.com/download"
    echo ""
    echo "  After installing, run this script again."
    echo ""
    exit 1
fi

# ── Step 2: Pull phi3 model ───────────────
echo ""
echo "▸ Checking phi3 model..."

if ollama list | grep -q "phi3"; then
    echo "  ✓ phi3 is already downloaded"
else
    echo "  Pulling phi3 (this may take a few minutes)..."
    ollama pull phi3
    echo "  ✓ phi3 downloaded"
fi

# ── Step 3: Python check ──────────────────
echo ""
echo "▸ Checking Python..."

if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo "  ✗ Python not found. Please install Python 3.8+ from https://python.org"
    exit 1
fi

echo "  ✓ Found $($PYTHON --version)"

# ── Step 4: Virtual environment ───────────
echo ""
echo "▸ Setting up Python virtual environment..."

if [ ! -d "backend/venv" ]; then
    $PYTHON -m venv backend/venv
    echo "  ✓ Virtual environment created"
else
    echo "  ✓ Virtual environment already exists"
fi

# Activate venv
source backend/venv/bin/activate

# ── Step 5: Install dependencies ──────────
echo ""
echo "▸ Installing Python dependencies..."
pip install --quiet --upgrade pip
pip install --quiet fastapi uvicorn requests pydantic
echo "  ✓ Dependencies installed"

# ── Step 6: Node / npm check ─────────────
echo ""
echo "▸ Checking Node.js..."

if command -v npm &> /dev/null; then
    echo "  ✓ Found $(node --version)"
    echo ""
    echo "▸ Installing frontend dependencies..."
    cd frontend && npm install --silent && cd ..
    echo "  ✓ Frontend dependencies installed"
else
    echo "  ✗ Node.js not found."
    echo "  → Install from https://nodejs.org (LTS version)"
    echo "  Then run: cd frontend && npm install"
fi

# ── Done ─────────────────────────────────
echo ""
echo "╔══════════════════════════════════════╗"
echo "║   ✓ Setup complete!                  ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "  To start the app, open 2 terminals:"
echo ""
echo "  Terminal 1 — Backend:"
echo "    cd backend"
echo "    source venv/bin/activate"
echo "    uvicorn main:app --reload"
echo ""
echo "  Terminal 2 — Frontend:"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "  Then open → http://localhost:3000"
echo ""