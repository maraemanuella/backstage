@echo off
cd /d E:\repositorios\backstage\backstage
set PYTHONPATH=E:\repositorios\backstage\backstage
set DJANGO_SETTINGS_MODULE=backstage.settings
echo Iniciando Daphne com suporte a WebSocket e HTTPS...
echo.
python -m daphne -e ssl:8000:privateKey=certs/localhost.key:certKey=certs/localhost.crt backstage.asgi:application
pause
