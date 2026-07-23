#!/usr/bin/env pwsh
# Script para iniciar o projeto História com Frontend e Backend

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "   Iniciando Projeto História" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar backend em processo paralelo
Write-Host "[1/2] Iniciando Backend (FastAPI)..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath "python" `
    -ArgumentList "-m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000" `
    -WorkingDirectory $PSScriptRoot `
    -WindowStyle Normal `
    -PassThru

# Aguardar backend iniciar
Write-Host "Aguardando backend iniciar..." -ForegroundColor Gray
Start-Sleep -Seconds 2

# Iniciar frontend em processo paralelo
Write-Host "[2/2] Iniciando Frontend (React + Vite)..." -ForegroundColor Yellow
$frontendJob = Start-Process -FilePath "npm" `
    -ArgumentList "run dev" `
    -WorkingDirectory "$PSScriptRoot\frontend" `
    -WindowStyle Normal `
    -PassThru

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "   ✅ Aplicação iniciada!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Docs:     http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar a aplicação" -ForegroundColor Yellow
Write-Host ""

# Aguardar processos terminarem
Wait-Process -Id $backendJob.Id
Wait-Process -Id $frontendJob.Id
