from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import WaitlistEntry
from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao


@api_view(['GET'])
@permission_classes([AllowAny])
def waitlist_status(request, event_id):
    evento = get_object_or_404(Evento, id=event_id, status='publicado')

    available = evento.vagas_disponiveis

    waiting_qs = WaitlistEntry.objects.filter(evento=evento, status='fila').order_by('created_at')

    user_position = None
    if request.user.is_authenticated:
        try:
            entry = waiting_qs.get(usuario=request.user)
            user_position = list(waiting_qs).index(entry) + 1
        except WaitlistEntry.DoesNotExist:
            user_position = None

    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    recent_cancel_count = Inscricao.objects.filter(evento=evento, status='cancelada', updated_at__gte=thirty_days_ago).count()
    recent_accepted_from_waitlist = WaitlistEntry.objects.filter(evento=evento, status='aceitou', notified_at__gte=thirty_days_ago).count()
    releases = recent_cancel_count + recent_accepted_from_waitlist
    average_release_per_day = releases / 30.0 if releases > 0 else max(0.1, evento.capacidade_maxima * 0.02)

    state = 'vaga' if available > 0 else 'fila'
    if user_position is None and available <= 0:
        state = 'fila'

    data = {
        'state': state,
        'position': user_position,
        'available_slots': available,
        'average_release_per_day': round(average_release_per_day, 2)
    }
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def waitlist_join(request, event_id):
    evento = get_object_or_404(Evento, id=event_id, status='publicado')
    user = request.user

    if evento.vagas_disponiveis > 0:
        return Response({'error': 'Ainda há vagas disponíveis – faça a inscrição normal.'}, status=status.HTTP_400_BAD_REQUEST)

    entry, created = WaitlistEntry.objects.get_or_create(usuario=user, evento=evento, defaults={
        'status': 'fila'
    })

    if not created:
        if entry.status == 'fila':
            waiting_qs = WaitlistEntry.objects.filter(evento=evento, status='fila').order_by('created_at')
            position = list(waiting_qs).index(entry) + 1
            return Response({'state': 'fila', 'position': position}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Você já possui uma entrada relacionada a este evento.'}, status=status.HTTP_400_BAD_REQUEST)

    waiting_qs = WaitlistEntry.objects.filter(evento=evento, status='fila').order_by('created_at')
    position = list(waiting_qs).index(entry) + 1

    Inscricao.objects.get_or_create(usuario=user, evento=evento, defaults={
        'nome_completo_inscricao': user.get_full_name() or user.username,
        'cpf_inscricao': user.cpf or '',
        'telefone_inscricao': user.telefone or '',
        'email_inscricao': user.email or '',
        'valor_original': evento.valor_deposito,
        'desconto_aplicado': 0,
        'valor_final': 0,
        'metodo_pagamento': 'pix',
        'aceita_termos': True,
        'status': 'lista_espera',
    })

    return Response({'state': 'fila', 'position': position}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def waitlist_leave(request, event_id):
    evento = get_object_or_404(Evento, id=event_id, status='publicado')
    user = request.user

    try:
        entry = WaitlistEntry.objects.get(usuario=user, evento=evento)
    except WaitlistEntry.DoesNotExist:
        try:
            inscr = Inscricao.objects.get(usuario=user, evento=evento)
            if inscr.status != 'lista_espera':
                return Response({'error': 'Você não está na lista de espera.'}, status=status.HTTP_400_BAD_REQUEST)
            inscr.delete()
            return Response({'state': 'saida'}, status=status.HTTP_200_OK)
        except Inscricao.DoesNotExist:
            return Response({'error': 'Você não está inscrito nem na lista de espera.'}, status=status.HTTP_400_BAD_REQUEST)

    if entry.status != 'fila':
        return Response({'error': 'Você não está na fila.'}, status=status.HTTP_400_BAD_REQUEST)

    entry.delete()

    Inscricao.objects.filter(usuario=user, evento=evento, status='lista_espera').delete()

    return Response({'state': 'saida'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def waitlist_suggestions(request, event_id):
    evento = get_object_or_404(Evento, id=event_id, status='publicado')

    qs = Evento.objects.filter(status='publicado').exclude(id=evento.id)
    candidates = []
    for ev in qs:
        score = 0
        if ev.categoria == evento.categoria:
            score += 3
        days_diff = abs((ev.data_evento - evento.data_evento).days)
        score += max(0, 5 - min(days_diff, 5))
        if ev.vagas_disponiveis > 0:
            score += 2
        candidates.append((score, ev))

    candidates.sort(key=lambda x: (-x[0], x[1].data_evento))
    results = []
    for _, ev in candidates[:6]:
        results.append({
            'id': str(ev.id),
            'titulo': ev.titulo,
            'data_evento': ev.data_evento,
            'foto_capa': ev.foto_capa.url if ev.foto_capa else None,
            'vagas_disponiveis': ev.vagas_disponiveis,
        })

    return Response(results)

