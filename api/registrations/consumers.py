"""
WebSocket Consumer para Check-in em Tempo Real
"""
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class CheckinConsumer(AsyncJsonWebsocketConsumer):
    """
    Consumer WebSocket para receber atualizações de check-in em tempo real
    """

    async def connect(self):
        """Conecta ao WebSocket e entra no grupo da inscrição"""
        self.inscricao_id = self.scope['url_route']['kwargs']['inscricao_id']
        self.room_group_name = f'checkin_{self.inscricao_id}'

        # Validar UUID
        try:
            uuid.UUID(str(self.inscricao_id))
        except ValueError:
            await self.close()
            return

        # Entrar no grupo do room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Enviar mensagem de confirmação de conexão
        await self.send_json({
            'type': 'connection_established',
            'message': 'Conectado ao canal de check-in',
            'inscricao_id': str(self.inscricao_id)
        })

    async def disconnect(self, close_code):
        """Desconecta do WebSocket e sai do grupo"""
        # Sair do grupo
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def checkin_update(self, event):
        """
        Handler para mensagens do tipo 'checkin_update'
        Envia atualização de check-in para o WebSocket
        """
        data = event['data']

        # Enviar mensagem para o WebSocket
        await self.send_json({
            'type': 'checkin_update',
            'data': data
        })

