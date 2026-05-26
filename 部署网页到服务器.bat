@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
title 部署办公系统网页到阿里云

echo.
echo 正在打包网页并上传到 118.31.109.161 ...
echo.

set EXPO_PUBLIC_API_URL=http://118.31.109.161
call npx expo export --platform web
if errorlevel 1 (
    echo 网页打包失败
    pause
    exit /b 1
)

set PEM=C:\Users\JD\Desktop\更换111.pem
if not exist "%PEM%" (
    echo 找不到密钥 %PEM% 请改 bat 里 PEM 路径
    pause
    exit /b 1
)

ssh -i "%PEM%" -o StrictHostKeyChecking=no root@118.31.109.161 "mkdir -p /var/www/office-manage"
scp -i "%PEM%" -o StrictHostKeyChecking=no -r "dist\*" root@118.31.109.161:/var/www/office-manage/
ssh -i "%PEM%" -o StrictHostKeyChecking=no root@118.31.109.161 "chmod -R a+rX /var/www/office-manage; systemctl restart nginx"

echo.
echo 完成！浏览器打开：
echo   http://118.31.109.161/office/
echo.
start http://118.31.109.161/office/
pause
