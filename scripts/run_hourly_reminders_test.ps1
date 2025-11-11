# Script de TESTE - executa a cada 1 MINUTO
# Para executar: .\run_hourly_reminders_test.ps1
# Use este script apenas para testar rapidamente!

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Backstage - Lembretes (MODO TESTE)" -ForegroundColor Cyan
Write-Host "Executando a cada 1 MINUTO" -ForegroundColor Yellow
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
    Write-Host "Próxima execução em 1 minuto..." -ForegroundColor Yellow
    Write-Host "Aguardando... (Pressione Ctrl+C para parar)" -ForegroundColor Gray
    Write-Host ""
    
    # Espera 1 minuto (60 segundos) - APENAS PARA TESTE
    Start-Sleep -Seconds 60
}
