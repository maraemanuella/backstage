"""
Views customizadas para o Django Admin
Geração de dados de teste com interface gráfica
"""

from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.management import call_command
from io import StringIO
import threading


def _run_generate_command_in_thread(num_users, num_events, num_inscricoes, num_avaliacoes, clear_data):
    """Helper que roda o comando em uma thread separada."""
    try:
        output = StringIO()
        call_command(
            'generate_test_data',
            users=num_users,
            events=num_events,
            inscricoes=num_inscricoes,
            avaliacoes=num_avaliacoes,
            clear=clear_data,
            stdout=output
        )
        # opcional: poderia gravar output em um arquivo de log
    except Exception:
        # opcional: logar exceção
        pass


@staff_member_required
def generate_test_data_view(request):
    """
    View para gerar dados de teste através do Django Admin.
    Em vez de executar o comando de forma síncrona (o que travava a requisição),
    iniciamos uma thread em background e retornamos imediatamente ao usuário.
    """
    if request.method == 'POST':
        # Capturar parâmetros do formulário
        try:
            num_users = int(request.POST.get('num_users', 10))
            num_events = int(request.POST.get('num_events', 5))
            num_inscricoes = int(request.POST.get('num_inscricoes', 20))
            num_avaliacoes = int(request.POST.get('num_avaliacoes', 15))
            clear_data = request.POST.get('clear_data') == 'on'
        except Exception:
            messages.error(request, 'Parâmetros inválidos para geração de dados.')
            return redirect('admin:index')

        # Iniciar thread em background para executar o comando
        thread = threading.Thread(
            target=_run_generate_command_in_thread,
            args=(num_users, num_events, num_inscricoes, num_avaliacoes, clear_data),
            daemon=True
        )
        thread.start()

        messages.success(request, 'Geração de dados iniciada em background. Verifique logs do servidor para acompanhar o progresso.')
        return redirect('admin:index')

    # GET - Mostrar formulário
    return render(request, 'admin/generate_test_data.html', {
        'title': 'Gerar Dados de Teste',
    })
