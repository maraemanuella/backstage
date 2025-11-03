@echo off
REM Script para alternar entre banco de dados LOCAL e NUVEM
REM Uso: switch_database.bat [local|nuvem]

setlocal enabledelayedexpansion

echo ========================================
echo  BACKSTAGE - Alternar Banco de Dados
echo ========================================
echo.

REM Verificar arquivo .env
if not exist ".env" (
    echo [ERRO] Arquivo .env nao encontrado!
    echo.
    pause
    exit /b 1
)

REM Se passou parâmetro, usa ele
if not "%1"=="" (
    set TIPO=%1
    goto :executar
)

REM Mostrar status atual
findstr /C:"USE_LOCAL_DB=True" .env >nul
if %ERRORLEVEL%==0 (
    echo [STATUS ATUAL] PostgreSQL LOCAL
    set ATUAL=local
) else (
    echo [STATUS ATUAL] PostgreSQL NA NUVEM ^(Supabase^)
    set ATUAL=nuvem
)

echo.
echo ========================================
echo  Escolha o Banco de Dados:
echo ========================================
echo.
echo  1. PostgreSQL LOCAL (localhost:5432)
echo  2. PostgreSQL NA NUVEM (Supabase)
echo  3. Cancelar
echo.
echo ========================================
echo.

set /p OPCAO="Digite sua opcao (1-3): "

if "%OPCAO%"=="1" set TIPO=local
if "%OPCAO%"=="2" set TIPO=nuvem
if "%OPCAO%"=="3" goto :cancelar

if "%TIPO%"=="" (
    echo.
    echo [ERRO] Opcao invalida!
    pause
    exit /b 1
)

:executar
echo.
echo ========================================

if /i "%TIPO%"=="local" (
    echo  Alternando para PostgreSQL LOCAL...
    powershell -Command "(Get-Content .env) -replace 'USE_LOCAL_DB=False', 'USE_LOCAL_DB=True' | Set-Content .env"
    echo.
    echo [OK] Configuracao atualizada!
    echo.
    echo  Banco de Dados: PostgreSQL LOCAL
    echo  Host: localhost
    echo  Porta: 5432
    echo  Database: backstage
    echo.
    echo  Certifique-se de que o PostgreSQL local esta rodando!
    echo.
) else if /i "%TIPO%"=="nuvem" (
    echo  Alternando para PostgreSQL NA NUVEM (Supabase)...
    powershell -Command "(Get-Content .env) -replace 'USE_LOCAL_DB=True', 'USE_LOCAL_DB=False' | Set-Content .env"
    echo.
    echo [OK] Configuracao atualizada!
    echo.
    echo  Banco de Dados: PostgreSQL NA NUVEM
    echo  Host: Supabase (aws-1-sa-east-1)
    echo  Porta: 6543
    echo  Database: postgres
    echo.
    echo  Conexao SSL habilitada
    echo.
) else (
    echo [ERRO] Tipo invalido! Use: local ou nuvem
    pause
    exit /b 1
)

echo ========================================
echo.
echo  IMPORTANTE:
echo  - Reinicie o servidor Django para aplicar as mudancas
echo  - Verifique se as migracoes estao aplicadas no banco escolhido
echo.
echo  Comandos uteis:
echo    python manage.py showmigrations   (ver status)
echo    python manage.py migrate          (aplicar migracoes)
echo.
echo ========================================
echo.

pause
goto :fim

:cancelar
echo.
echo [INFO] Operacao cancelada.
echo.
pause

:fim
endlocal

