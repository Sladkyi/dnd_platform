# dnd_platform/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Логика подключения
        self.room_name = 'some_room'
        self.room_group_name = f"chat_{self.room_name}"

        # Подключаем к группе
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Принять соединение (обновить статус на открытый)
        await self.accept()

    async def disconnect(self, close_code):
        # Отключаемся от группы
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Получаем сообщение от клиента
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Отправляем сообщение в группу
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        # Отправляем сообщение обратно в WebSocket
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
