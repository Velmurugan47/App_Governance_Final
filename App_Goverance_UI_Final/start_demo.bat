@echo off
echo ========================================
echo Starting App Governance Application
echo DEMO MODE (No API Key Required)
echo ========================================
echo.

echo Starting Backend Server (Demo Mode)...
start "Backend Server - DEMO" cmd /k "set PYTHONPATH=%CD% && .venv\Scripts\python.exe backend\demo_api_server.py"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul
