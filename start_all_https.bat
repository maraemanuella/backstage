@echo off
REM Script mestre para iniciar Backend HTTPS + Frontend HTTPS simultaneamente
REM Uso: start_all_https.bat

echo ========================================
echo  BACKSTAGE - Inicializacao Completa
echo  Backend HTTPS + Frontend HTTPS
echo ========================================
echo.

REM Verificar certificados
if not exist "ssl_certs\cert.pem" (
    echo [ERRO] Certificados SSL nao encontrados!
    echo.
    echo Gerando certificados automaticamente...
    python generate_ssl_cert_alt.py
    echo.
    if not exist "ssl_certs\cert.pem" (
        echo [ERRO] Falha ao gerar certificados!
        pause
        exit /b 1
    )
)

REM Descobrir IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo ========================================
echo  Iniciando Servicos...
echo ========================================
echo.
echo [1/2] Backend HTTPS (Django + WebSocket)
echo [2/2] Frontend HTTPS (Vite + React)
echo.
echo ========================================
echo  URLs de Acesso:
echo ========================================
echo.
echo  Frontend:
echo    - Local:  https://localhost:5173
echo    - Rede:   https://%IP%:5173
echo.
echo  Backend:
echo    - Local:  https://localhost:8000
echo    - Rede:   https://%IP%:8000
echo.
echo  Admin:
echo    - https://localhost:8000/admin/
echo.
echo ========================================
echo  CELULAR: Use https://%IP%:5173
echo ========================================
echo.

REM Iniciar backend em nova janela
start "Backend HTTPS" cmd /k "cd /d %~dp0 && start_https_server.bat"

REM Aguardar 3 segundos
timeout /t 3 /nobreak > nul

REM Iniciar frontend em nova janela
start "Frontend HTTPS" cmd /k "cd /d %~dp0frontend && start_frontend_https.bat"

echo.
echo ========================================
echo  Servicos Iniciados!
echo ========================================
echo.
echo [OK] Backend HTTPS em execucao
echo [OK] Frontend HTTPS em execucao
echo.
echo Duas janelas foram abertas:
echo   1. Backend HTTPS (porta 8000)
echo   2. Frontend HTTPS (porta 5173)
echo.
echo Feche esta janela com seguranca.
echo Para parar os servicos, feche as janelas Backend e Frontend.
echo.

pause

