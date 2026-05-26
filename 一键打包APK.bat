@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Office Manage - 一键打包 APK
cd /d "%~dp0"

echo.
echo  ============================================
echo    Office Manage  一键打包 Android APK
echo  ============================================
echo.
echo  说明：全程在本窗口完成，不要关闭黑窗口。
echo.

echo  [1/5] 检查是否已登录 Expo...
call npx eas-cli whoami > expo-login-status.txt 2>&1
findstr /i /c:"Not logged in" expo-login-status.txt >nul
if !errorlevel! equ 0 (
    echo.
    echo  >> 还没登录，马上会打开浏览器。
    echo  >> 请在网页里点「Authorize / 授权」，然后回到这里。
    echo.
    pause
    call npx eas-cli login
    if errorlevel 1 (
        echo.
        echo  登录失败。请重新双击本文件再试。
        pause
        exit /b 1
    )
)
echo  登录 OK.
echo.

echo  [2/5] 安装/检查依赖（首次较慢，请等待）...
if not exist "node_modules\" (
    call npm install
)
call npx expo install --fix >nul 2>&1
echo  依赖 OK.
echo.

echo  [3/5] 关联 Expo 云端项目（首次会问，一律输入 Y 回车）...
if not exist "app.json" (
    echo  缺少 app.json，请确认在 office_mobile 目录运行。
    pause
    exit /b 1
)
echo.

echo  [4/5] 开始云端打包 APK（云端排队，通常 15~40 分钟）...
echo.
echo  --------------------------------------------
echo  下面会出现 https://expo.dev/... 链接，用浏览器看进度
echo  完成后点 Download 下载 APK，发给安卓手机安装
echo  API 已指向阿里云：http://118.31.109.161 （80端口，手机4G可用）
echo  别人手机有网（4G/WiFi 都行），不用和你电脑同一 WiFi
echo  若超过 40 分钟日志不往下走：网页点 Cancel，改天再双击本文件
echo  --------------------------------------------
echo.
echo  若提示 Generate keystore / Create project：直接按回车用默认即可
echo.
pause
call npx eas-cli build --platform android --profile preview
if errorlevel 1 (
    echo.
    echo  打包未成功。请把本窗口最后 30 行复制发给技术人员。
    pause
    exit /b 1
)

echo.
echo  [5/5] 已提交云端打包！
echo.
echo  下载 APK：浏览器 https://expo.dev  - 登录 - Builds - Download
echo  装到任意安卓手机，有网即可使用（连阿里云服务器）
echo  登录账号：admin  /  admin123
echo  浏览器也可访问：http://118.31.109.161/office/
echo  测试：http://118.31.109.161/health 应显示 ok
echo.
start https://expo.dev
pause
endlocal
