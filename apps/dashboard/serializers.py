from rest_framework import serializers


# ===========================
# DASHBOARD ADMIN SERIALIZERS
# ===========================

class DashboardMetricasSerializer(serializers.Serializer):
    usuarios_ativos = serializers.IntegerField()
    eventos_realizados = serializers.IntegerField()
    revenue_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    taxa_crescimento = serializers.FloatField()


class DashboardOrganizadoresSerializer(serializers.Serializer):
    total_organizadores = serializers.IntegerField()
    verificados = serializers.IntegerField()
    nao_verificados = serializers.IntegerField()
    eventos_verificados = serializers.IntegerField()
    eventos_nao_verificados = serializers.IntegerField()
    percentual_verificados = serializers.FloatField()


class DashboardVerificacoesSerializer(serializers.Serializer):
    pendentes = serializers.IntegerField()
    verificando = serializers.IntegerField()
    aprovados = serializers.IntegerField()
    rejeitados = serializers.IntegerField()
    ultimos_7_dias = serializers.IntegerField()
    ultimos_30_dias = serializers.IntegerField()


class DashboardPerformanceSerializer(serializers.Serializer):
    inscricoes_mes = serializers.IntegerField()
    taxa_conversao = serializers.FloatField()
    eventos_populares = serializers.ListField()
