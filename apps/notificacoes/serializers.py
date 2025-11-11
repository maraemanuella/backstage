from rest_framework import serializers
from .models import Notificacao


class NotificacaoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    tempo_decorrido = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacao
        fields = [
            'id',
            'tipo',
            'tipo_display',
            'titulo',
            'mensagem',
            'lida',
            'link',
            'created_at',
            'tempo_decorrido',
        ]
        read_only_fields = ['id', 'created_at', 'tipo_display', 'tempo_decorrido']
    
    def get_tempo_decorrido(self, obj):
        """Retorna tempo decorrido em formato amigável."""
        from datetime import datetime, timezone
        
        agora = datetime.now(timezone.utc)
        diferenca = agora - obj.created_at
        
        minutos = int(diferenca.total_seconds() / 60)
        horas = int(minutos / 60)
        dias = int(horas / 24)
        
        if minutos < 1:
            return 'Agora'
        elif minutos < 60:
            return f'Há {minutos} minuto{"s" if minutos > 1 else ""}'
        elif horas < 24:
            return f'Há {horas} hora{"s" if horas > 1 else ""}'
        elif dias < 7:
            return f'Há {dias} dia{"s" if dias > 1 else ""}'
        else:
            return obj.created_at.strftime('%d/%m/%Y')
