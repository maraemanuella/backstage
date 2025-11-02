import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

class CheckinConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.inscricao_id = self.scope['url_route']['kwargs']['inscricao_id']
        self.room_group_name = f'checkin_{self.inscricao_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"WebSocket conectado para inscrição: {self.inscricao_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket desconectado para inscrição: {self.inscricao_id}")

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')

        print(f"Mensagem recebida: {message}")

    # Receive message from room group
    async def checkin_update(self, event):
        """
        Handler para receber atualizações de check-in do grupo
        """
        checkin_data = event['data']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'checkin_update',
            'data': checkin_data
        }))
        print(f"Atualização de check-in enviada: {checkin_data}")
