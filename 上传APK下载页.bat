@echo off
chcp 65001 >nul
setlocal

set SERVER=118.31.109.161
set PEM=C:\Users\JD\Desktop\更换111.pem
set APK=office-manage-1.0.2.apk

cd /d "%~dp0.."

if not exist "%APK%" (
    echo [错误] 找不到 %APK%
    echo 请先把 APK 放到 office_mobile 目录，或修改本脚本里的 APK 文件名。
    pause
    exit /b 1
)

echo === 1. 上传 APK 和下载页到服务器 ===
ssh -i "%PEM%" -o StrictHostKeyChecking=no root@%SERVER% "mkdir -p /var/www/office-download"
scp -i "%PEM%" -o StrictHostKeyChecking=no "%APK%" root@%SERVER%:/var/www/office-download/office-manage-1.0.2.apk
scp -i "%PEM%" -o StrictHostKeyChecking=no "deploy\download\index.html" root@%SERVER%:/var/www/office-download/index.html
scp -i "%PEM%" -o StrictHostKeyChecking=no "..\office_backend\deploy\nginx-office.conf" root@%SERVER%:/etc/nginx/conf.d/travel.conf

echo === 2. 重载 Nginx ===
ssh -i "%PEM%" -o StrictHostKeyChecking=no root@%SERVER% "nginx -t && systemctl reload nginx"

echo.
echo ========================================
echo   下载页（含二维码）:
echo   http://%SERVER%/download/
echo.
echo   APK 直链:
echo   http://%SERVER%/download/office-manage-1.0.2.apk
echo ========================================
echo.
echo 把下载页链接或二维码发给别人，安卓扫码即可下载。
start http://%SERVER%/download/
pause
