@echo off
REM Script para iniciar servidor Django com HTTPS e WebSocket
REM Uso: start_https_server.bat

echo ========================================
echo  BACKSTAGE - Servidor HTTPS + WebSocket
echo ========================================
echo.

REM Verificar se os certificados existem
if not exist "ssl_certs\cert.pem" (
    echo [ERRO] Certificados SSL nao encontrados!
    echo.
    echo Execute primeiro: python generate_ssl_cert_alt.py
    echo.
    pause
    exit /b 1
)

echo [OK] Certificados SSL encontrados
echo.

REM Descobrir IP local
echo Descobrindo IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%
echo.
echo ========================================
echo  URLs de Acesso:
echo ========================================
echo.
echo  Local (este computador):
echo    https://localhost:8000
echo    https://127.0.0.1:8000
echo.
echo  Rede local (outros dispositivos):
echo    https://%IP%:8000
echo.
echo ========================================
echo  Instrucoes para Celular:
echo ========================================
echo.
echo  1. Conecte o celular na MESMA rede WiFi
echo  2. Acesse: https://%IP%:8000
echo  3. Aceite o certificado auto-assinado:
echo     - Android: "Avancado" > "Continuar assim mesmo"
echo     - iOS: "Avancado" > "Visitar este site"
echo  4. A camera do QR code funcionara!
echo.
echo ========================================
echo.

REM Iniciar servidor HTTPS com WebSocket (Daphne)
echo Iniciando servidor HTTPS com WebSocket...
echo.
echo [INFO] Use Ctrl+C para parar o servidor
echo.

daphne -e ssl:8000:privateKey=ssl_certs/key.pem:certKey=ssl_certs/cert.pem settings.asgi:application

REM Se daphne não funcionar, tenta runsslserver
if %ERRORLEVEL% neq 0 (
    echo.
    echo [AVISO] Daphne falhou, tentando runsslserver...
    echo.
    python manage.py runsslserver 0.0.0.0:8000 --certificate ssl_certs/cert.pem --key ssl_certs/key.pem
)

pause

