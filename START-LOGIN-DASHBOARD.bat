@echo off
REM Start login-dashboard dan auto-open browser di Windows
cd login-dashboard
echo Starting login-dashboard server...
timeout /t 3
start http://localhost:3000
npm start
pause
