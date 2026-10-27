@echo off
chcp 65001 >nul
title Shelter Mind - 3D Brain Dot Atlas & Unity BCI Replay Server
cd /d "%~dp0"

echo ====================================================================
echo  [국립부경대학교 캡스톤디자인 - 팀 영크크 (Shelter Mind)]
echo  1. 3D 뇌 Dot 아틀라스 결과 사이트 오픈 (web/index.html)
echo  2. 실측 뇌파 리플레이 서버 구동 (Unity TCP :5000 / Web :8080)
echo ====================================================================

where conda >nul 2>nul
if %errorlevel%==0 (
    start "" "http://127.0.0.1:8080"
    conda run --no-capture-output python real_eeg_replay_server.py
    goto :eof
)

powershell -ExecutionPolicy Bypass -File "%~dp0run_replay_bridge.ps1"
pause
