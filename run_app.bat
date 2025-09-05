@echo off
REM Start backend in new window
start "Backend" cmd /k "run_backend.bat"

REM Wait a bit to ensure backend starts
timeout /t 5 /nobreak >nul

REM Start frontend in new window
start "Frontend" cmd /k "run_frontend.bat"

REM Wait 5 seconds before sending "o"
timeout /t 5 /nobreak >nul

REM Send "o" + Enter to the frontend window
powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.AppActivate('Frontend'); Start-Sleep -Milliseconds 500; $wshell.SendKeys('o{ENTER}')"

pause
