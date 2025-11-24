from rest_framework import serializers
from apps.users.models import CustomUser
from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao
from apps.transferencias.models import TransferRequest


class DashboardMetricasSerializer(serializers.Serializer):
    """Serializer for global system metrics"""
    usuarios_ativos = serializers.IntegerField()
    eventos_realizados = serializers.IntegerField()
    revenue_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    taxa_crescimento = serializers.FloatField()


class DashboardOrganizadoresSerializer(serializers.Serializer):
    """Serializer for organizer statistics"""
    total_organizadores = serializers.IntegerField()
    verificados = serializers.IntegerField()
    nao_verificados = serializers.IntegerField()
    percentual_verificados = serializers.FloatField()
    eventos_verificados = serializers.IntegerField()
    eventos_nao_verificados = serializers.IntegerField()


class DashboardVerificacoesSerializer(serializers.Serializer):
    """Serializer for document verification statistics"""
    pendentes = serializers.IntegerField()
    verificando = serializers.IntegerField()
    aprovados = serializers.IntegerField()
    rejeitados = serializers.IntegerField()
    ultimos_7_dias = serializers.IntegerField()
    ultimos_30_dias = serializers.IntegerField()


class DashboardPerformanceSerializer(serializers.Serializer):
    """Serializer for system performance metrics"""
    inscricoes_mes = serializers.IntegerField()
    taxa_conversao = serializers.FloatField()
    eventos_populares = serializers.ListField()


class DashboardLogInscricaoSerializer(serializers.Serializer):
    """Serializer for recent inscription logs"""
    id = serializers.IntegerField()
    usuario__username = serializers.CharField()
    evento__titulo = serializers.CharField()
    status_pagamento = serializers.CharField()
    created_at = serializers.DateTimeField()


class DashboardLogTransferenciaSerializer(serializers.Serializer):
    """Serializer for recent transfer logs"""
    id = serializers.IntegerField()
    from_user__username = serializers.CharField()
    to_user__username = serializers.CharField()
    inscricao__evento__titulo = serializers.CharField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
