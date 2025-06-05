from channels.generic.websocket import AsyncWebsocketConsumer
import json

class MapConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.map_id = self.scope['url_route']['kwargs']['map_id']
        self.group_name = f"map_{self.map_id}"

        # Подключаемся к группе (игровой карте)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Получено сообщение от клиента: {text_data}")
        # Рассылаем всем участникам в группе
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'shape_moved',
                'payload': data
            }
        )

    async def shape_moved(self, event):
        await self.send(text_data=json.dumps(event['payload']))

