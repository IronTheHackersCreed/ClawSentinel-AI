# Iniciar el Backend en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python main.py"

# Iniciar el Frontend en una nueva ventana
Set-Location dashboard
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "ClawSentinel-AI se está iniciando..." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173 o 5174"
