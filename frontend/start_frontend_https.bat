@echo off
REM Script para iniciar Frontend com HTTPS
REM Uso: start_frontend_https.bat

echo ========================================
echo  FRONTEND - Servidor HTTPS (Vite)
echo ========================================
echo.

REM Verificar se está na pasta frontend
if not exist "package.json" (
    echo [ERRO] Execute este script dentro da pasta frontend!
    echo.
    pause
    exit /b 1
)

REM Verificar se os certificados existem na raiz do projeto
if not exist "..\ssl_certs\cert.pem" (
    echo [ERRO] Certificados SSL nao encontrados!
    echo.
    echo Execute primeiro na raiz do projeto:
    echo   python generate_ssl_cert_alt.py
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
echo    https://localhost:5173
echo.
echo  Rede local (outros dispositivos):
echo    https://%IP%:5173
echo.
echo ========================================
echo  Instrucoes:
echo ========================================
echo.
echo  1. Aceite o certificado auto-assinado no navegador
echo  2. No celular, conecte na mesma rede WiFi
echo  3. Acesse https://%IP%:5173 e aceite o certificado
echo  4. Backend deve estar rodando em HTTPS tambem!
echo.
echo ========================================
echo.

echo Iniciando servidor de desenvolvimento com HTTPS...
echo.
echo [INFO] Use Ctrl+C para parar o servidor
echo.

npm run dev

pause

