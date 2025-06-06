from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
import logging

from .models import Map, Shape

logger = logging.getLogger(__name__)

class MapConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.map_id = self.scope["url_route"]["kwargs"]["map_id"]
        self.group_name = f"map_{self.map_id}"

        has_access = await self._user_has_access(self.scope["user"])
        if not has_access:
            logger.warning(
                "User %s has no access to map %s", self.scope["user"], self.map_id
            )
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json({"type": "connection", "status": "ok"})

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            message = json.loads(text_data)
        except json.JSONDecodeError:
            logger.error("Invalid JSON received: %s", text_data)
            await self.send_json({"error": "invalid_json"})
            return

        action = message.get("action")
        payload = message.get("payload", {})
        if action == "move":
            if not self._validate_move_payload(payload):
                await self.send_json({"error": "invalid_payload"})
                return
            await self._update_shape_position(
                payload["id"], float(payload["x"]), float(payload["y"])
            )

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "broadcast_event",
                    "action": action,
                    "payload": payload,
                    "sender": self.channel_name,
                },
            )
        else:
            logger.warning("Unknown action: %s", action)

    async def broadcast_event(self, event):
        if event.get("sender") == self.channel_name:
            return
        await self.send(text_data=json.dumps({"action": event.get("action"), "payload": event.get("payload")}))

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))

    @database_sync_to_async
    def _user_has_access(self, user):
        try:
            map_obj = Map.objects.get(id=self.map_id)
        except Map.DoesNotExist:
            return False
        if not user.is_authenticated:
            return False
        return map_obj.user == user

    @database_sync_to_async
    def _update_shape_position(self, shape_id, x, y):
        try:
            shape = Shape.objects.get(id=shape_id, map_id=self.map_id)
        except Shape.DoesNotExist:
            return False
        shape.x = x
        shape.y = y
        shape.save(update_fields=["x", "y"])
        return True

    def _validate_move_payload(self, payload):
        try:
            _ = int(payload["id"])
            _ = float(payload["x"])
            _ = float(payload["y"])
        except (KeyError, TypeError, ValueError):
            return False
        return True