@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Office Manage - Build APK
cd /d "%~dp0"

echo.
echo  ============================================
echo    Office Manage - Build Android APK
echo  ============================================
echo.

:check_login
echo [1/4] Check Expo login...
call npx eas-cli whoami > expo-login-status.txt 2>&1
type expo-login-status.txt
findstr /i /c:"Not logged in" expo-login-status.txt >nul
if !errorlevel! equ 0 (
    echo.
    echo  Not logged in. Browser will open - click Authorize.
    echo.
    pause
    call npx eas-cli login
    goto check_login
)
echo  Login OK.
echo.

echo [2/4] npm install if needed...
if not exist "node_modules\" call npm install
echo.

echo [3/4] Start cloud build APK (about 10-20 minutes)...
echo  When you see expo.dev link, open it in browser.
echo  First time: type Y for Create project, Enter for keystore.
echo.
pause

call npx eas-cli build --platform android --profile preview
set BUILD_ERR=!errorlevel!

echo.
if !BUILD_ERR! neq 0 (
    echo  Build failed. Copy the red text above and ask for help.
) else (
    echo  Build submitted! Open https://expo.dev - Builds - Download APK
    start https://expo.dev
)
echo.
pause
endlocal
