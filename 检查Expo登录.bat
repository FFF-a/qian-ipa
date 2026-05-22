@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Checking Expo login... > expo-login-status.txt
call npx eas-cli whoami >> expo-login-status.txt 2>&1
echo. >> expo-login-status.txt
echo Saved to: expo-login-status.txt
type expo-login-status.txt
echo.
pause
