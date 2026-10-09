@echo off
setlocal
set "DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%DIR%mvnw.ps1" %*
exit /b %ERRORLEVEL%
