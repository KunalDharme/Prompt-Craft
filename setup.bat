@echo off
setlocal enabledelayedexpansion

:: ─────────────────────────────────────────
::  PromptCraft — Setup Script (Windows)
:: ─────────────────────────────────────────

echo.
echo  ╔══════════════════════════════════════╗
echo  ║       PromptCraft Setup              ║
echo  ║       Windows                        ║
echo  ╚══════════════════════════════════════╝
echo.

:: ── Step 1: Check Ollama ─────────────────
echo  ^> Checking Ollama...

where ollama >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo    X  Ollama is not installed.
    echo.
    echo    Please install it manually:
    echo    ^>^> https://ollama.com/download
    echo.
    echo    After installing, run this script again.
    echo.
    pause
    exit /b 1
) else (
    echo    OK  Ollama is already installed
)

:: ── Step 2: Pull phi3 model ──────────────
echo.
echo  ^> Checking phi3 model...

ollama list | findstr "phi3" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    Pulling phi3 (this may take a few minutes^)...
    ollama pull phi3
    echo    OK  phi3 downloaded
) else (
    echo    OK  phi3 is already downloaded
)

:: ── Step 3: Python check ─────────────────
echo.
echo  ^> Checking Python...

where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    X  Python not found.
    echo    Install Python 3.8+ from https://python.org
    echo    Make sure to check "Add Python to PATH" during install.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do echo    OK  Found %%i

:: ── Step 4: Virtual environment ──────────
echo.
echo  ^> Setting up Python virtual environment...

if not exist "backend\venv" (
    python -m venv backend\venv
    echo    OK  Virtual environment created
) else (
    echo    OK  Virtual environment already exists
)

:: Activate venv
call backend\venv\Scripts\activate.bat

:: ── Step 5: Install dependencies ─────────
echo.
echo  ^> Installing Python dependencies...
pip install --quiet --upgrade pip
pip install --quiet fastapi uvicorn requests pydantic
echo    OK  Dependencies installed

:: ── Step 6: Node / npm check ─────────────
echo.
echo  ^> Checking Node.js...

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    X  Node.js not found.
    echo    Install from https://nodejs.org (LTS version^)
    echo    Then run: cd frontend ^&^& npm install
) else (
    for /f "tokens=*" %%i in ('node --version') do echo    OK  Found Node %%i
    echo.
    echo  ^> Installing frontend dependencies...
    cd frontend
    npm install --silent
    cd ..
    echo    OK  Frontend dependencies installed
)

:: ── Done ─────────────────────────────────
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   OK  Setup complete!                ║
echo  ╚══════════════════════════════════════╝
echo.
echo    To start the app, open 2 terminals:
echo.
echo    Terminal 1 — Backend:
echo      cd backend
echo      venv\Scripts\activate
echo      uvicorn main:app --reload
echo.
echo    Terminal 2 — Frontend:
echo      cd frontend
echo      npm run dev
echo.
echo    Then open ^> http://localhost:3000
echo.
pause