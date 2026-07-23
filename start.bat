@echo off
REM Script para iniciar o projeto História com Frontend e Backend

echo ===================================
echo   Iniciando Projeto História
echo ===================================

REM Iniciar backend em uma nova janela
echo.
echo [1/2] Iniciando Backend (FastAPI)...
start "Backend - História" cmd /k "cd /d backend && set PYTHONPATH=. && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Aguardar um pouco para o backend iniciar
timeout /t 3 /nobreak

REM Iniciar frontend em uma nova janela
echo [2/2] Iniciando Frontend (React + Vite)...
start "Frontend - História" cmd /k "cd /d frontend && npm run dev"

echo.
echo ===================================
echo   ✅ Aplicação iniciada!
echo ===================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo Docs:     http://localhost:8000/docs
echo.
pause
