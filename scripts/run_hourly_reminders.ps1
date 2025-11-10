# Script para executar lembretes de eventos a cada hora
# Para executar: .\run_hourly_reminders.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Backstage - Lembretes Automáticos" -ForegroundColor Cyan
Write-Host "Executando a cada hora..." -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Loop infinito
while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timestamp] Executando comando de lembretes..." -ForegroundColor Green
    
    # Executa o comando
    python manage.py send_event_reminders_hourly
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$timestamp] Comando executado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "[$timestamp] Erro ao executar comando (código: $LASTEXITCODE)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Próxima execução em 1 hora..." -ForegroundColor Yellow
    Write-Host "Aguardando... (Pressione Ctrl+C para parar)" -ForegroundColor Gray
    Write-Host ""
    
    # Espera 1 hora (3600 segundos)
    Start-Sleep -Seconds 3600
}
