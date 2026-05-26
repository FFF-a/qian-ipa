@echo off
chcp 65001 >nul
echo ========================================
echo   iOS IPA - GitHub Actions + 爱思助手
echo ========================================
echo.
echo 【推荐流程】
echo   1. push 代码到 GitHub
echo   2. Actions -^> Build iOS IPA (unsigned) -^> Run workflow
echo   3. 下载 Artifacts: office-manage-unsigned.ipa
echo   4. 爱思助手导入 IPA，用 Apple ID 签名安装
echo.
echo 详细步骤: 爱思助手安装IPA.md
echo.
start "" "%~dp0爱思助手安装IPA.md"
pause
