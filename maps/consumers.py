import json
import logging
import time
import math
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import F
from .models import Shape, Map
from .serializers import ShapeSerializer

logger = logging.getLogger(__name__)

class MapConsumer(AsyncWebsocketConsumer):
    MAX_SUBSCRIPTIONS = 10
    MIN_MOVE_INTERVAL = 0.1

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.subscribed_groups = set()
        self.last_move_time = 0
        self.move_lock = asyncio.Lock()

    async def receive(self, text_data):
        print(f"📥 Получено сообщение: {text_data}")
        try:
            message = json.loads(text_data)
            action = message.get("action")
            payload = message.get("payload", {})

            print(f"➡️ Действие: {action}")
            print(f"🧾 Payload: {payload}")
        except json.JSONDecodeError:
            print(f"❌ Неверный JSON: {text_data}")
            await self.send_json({"error": "invalid_json"})
            return

        if action == "subscribe":
            await self._handle_subscribe(payload)
        elif action == "unsubscribe":
            await self._handle_unsubscribe(payload)
        elif action == "move":
            async with self.move_lock:

                if not self._validate_move_payload(payload):
                    print(f"❌ Invalid move payload: {payload}")
                    await self.send_json({"error": "invalid_payload"})
                    return

                now = time.time()
                if now - self.last_move_time < self.MIN_MOVE_INTERVAL:
                    print("⚠️ Move throttled due to spam")
                    await self.send_json({"error": "too_many_requests"})
                    return

                self.last_move_time = now
                success = await self._update_shape_position(
                    payload["id"], float(payload["x"]), float(payload["y"])
                )

                if success:
                    group_name = f"map_{success.current_map_id}"
                    try:
                        print(f"📤 Отправляем в группу: {group_name}")
                        await self.channel_layer.group_send(
                            group_name,
                            {
                                "type": "broadcast_event",
                                "action": "move",
                                "payload": payload,
                                "sender": self.channel_name,
                            }
                        )
                    except Exception as e:
                        print(f"❌ Ошибка при отправке в группу {group_name}: {e}")
                else:
                    await self.send_json({"error": "shape_not_found_or_no_permission"})

        elif action == "turn_order_init":
            await self._init_turn_order(payload)
        elif action == "next_turn":
            await self._next_turn(payload)


        elif action == "item_create":
            map_id = payload.get("map_id")
            if map_id:
                await self.channel_layer.group_send(
                    f"map_{map_id}",
                    {
                        "type": "broadcast_event",
                        "action": "item_create",
                        "payload": payload.get("item_instance"),
                    }
                )

        elif action == "item_update":
            map_id = payload.get("map_id")
            if map_id:
                await self.channel_layer.group_send(
                    f"map_{map_id}",
                    {
                        "type": "broadcast_event",
                        "action": "item_update",
                        "payload": payload.get("item_instance"),
                    }
                )

        elif action == "item_delete":
            map_id = payload.get("map_id")
            if map_id:
                await self.channel_layer.group_send(
                    f"map_{map_id}",
                    {
                        "type": "broadcast_event",
                        "action": "item_delete",
                        "payload": payload.get("item_instance"),
                    }
                )


        elif action == 'create_room':
            map_id = payload.get("map_id")  # 🔥 Обязательно
            await self.channel_layer.group_send(
                f"map_{map_id}",
                {
                    "type": "broadcast_event",
                    "action": "create_room",
                    "payload": {"room": payload.get("room")},
                }
            )

        elif action == 'switch_room':
            map_id = payload.get("map_id")  # 🔥 Обязательно
            await self.channel_layer.group_send(
                f"map_{map_id}",
                {
                    "type": "broadcast_event",
                    "action": "switch_room",
                    "payload": {
                        "room_id": payload.get("room_id"),
                        "background_image": payload.get("background_image"),
                    },
                }
            )






        else:
            print(f"⚠️ Неизвестное действие: {action}")
            await self.send_json({"error": f"unknown_action: {action}"})

    async def _init_turn_order(self, payload):
        map_id = payload.get("map_id")
        turn_order = payload.get("turn_order")

        if not map_id or not turn_order:
            await self.send_json({"error": "missing_data_in_turn_order_init"})
            return

        await self._init_turn_order_db(map_id, turn_order)

        await self.channel_layer.group_send(
            f"map_{map_id}",
            {
                "type": "broadcast_event",
                "action": "turn_update",
                "payload": {"current_shape_id": turn_order[0]},
            },
        )

    @database_sync_to_async
    def _init_turn_order_db(self, map_id, turn_order):
        Map.objects.filter(id=map_id).update(turn_order=turn_order, current_turn_index=0)

    async def _next_turn(self, payload):
        map_id = payload.get("map_id")
        if not map_id:
            await self.send_json({"error": "missing_map_id_in_next_turn"})
            return

        next_shape_id = await self._next_turn_db(map_id)
        if next_shape_id is None:
            await self.send_json({"error": "empty_turn_order"})
            return

        await self.channel_layer.group_send(
            f"map_{map_id}",
            {
                "type": "broadcast_event",
                "action": "turn_update",
                "payload": {"current_shape_id": next_shape_id},
            },
        )

    @database_sync_to_async
    def _next_turn_db(self, map_id):
        try:
            map_instance = Map.objects.get(id=map_id)
            if not map_instance.turn_order:
                return None

            map_instance.current_turn_index = (map_instance.current_turn_index + 1) % len(map_instance.turn_order)
            map_instance.save(update_fields=['current_turn_index'])
            return map_instance.turn_order[map_instance.current_turn_index]
        except Map.DoesNotExist:
            return None

    async def _handle_subscribe(self, payload):
        map_id = payload.get("map_id")
        if not map_id:
            print("❌ Missing map_id in subscribe payload")
            await self.send_json({"error": "missing_map_id"})
            return

        if len(self.subscribed_groups) >= self.MAX_SUBSCRIPTIONS:
            print("⚠️ Too many subscriptions")
            await self.send_json({"error": "too_many_subscriptions"})
            return

        group_name = f"map_{map_id}"
        if group_name not in self.subscribed_groups:
            await self.channel_layer.group_add(group_name, self.channel_name)
            self.subscribed_groups.add(group_name)
            print(f"✅ Subscribed to map {map_id} ({group_name})")

        shapes = await self._get_map_shapes(map_id)
        await self.send_json({
            "action": "map_sync",
            "payload": shapes
        })

    async def _handle_unsubscribe(self, payload):
        map_id = payload.get("map_id")
        if not map_id:
            print("❌ Missing map_id in unsubscribe payload")
            await self.send_json({"error": "missing_map_id"})
            return

        group_name = f"map_{map_id}"
        if group_name in self.subscribed_groups:
            await self.channel_layer.group_discard(group_name, self.channel_name)
            self.subscribed_groups.remove(group_name)
            print(f"📴 Unsubscribed from map {map_id}")

    async def broadcast_event(self, event):
        if event.get("sender") == self.channel_name:
            return

        await self.send_json({
            "action": event["action"],
            "payload": event["payload"],
        })

    async def send_json(self, data):
        await super().send(text_data=json.dumps(data))

    @database_sync_to_async
    def _get_map_shapes(self, map_id):
        shapes = Shape.objects.filter(current_map_id=map_id)
        return ShapeSerializer(shapes, many=True).data

    async def _update_shape_position(self, shape_id, x, y):
        user = self.scope.get("user")
        shape = await self._get_shape(shape_id)
        
        if not shape:
            print(f"❌ Shape not found: {shape_id}")
            return False

        has_permission = await self._check_shape_permission(shape, user)
        if not has_permission:
            print(f"❌ Пользователь {user} пытался переместить чужую фигуру {shape_id}")
            return False

        if not (-10000 <= x <= 10000) or not (-10000 <= y <= 10000):
            print(f"❌ Некорректные координаты: {x}, {y}")
            return False

        if math.isnan(x) or math.isnan(y) or math.isinf(x) or math.isinf(y):
            print("❌ Не числовое значение координаты")
            return False

        await self._save_shape_position(shape, x, y)
        print(f"✅ Updated shape {shape_id} position by user {user}")
        return shape

    @database_sync_to_async
    def _get_shape(self, shape_id):
        try:
            return Shape.objects.get(id=shape_id)
        except Shape.DoesNotExist:
            return None

    @database_sync_to_async
    def _check_shape_permission(self, shape, user):
        if shape.owner_id == user.id or shape.user_id == user.id:
            return True
        if shape.current_map and shape.current_map.user_id == user.id:
            return True
        return False

    @database_sync_to_async
    def _save_shape_position(self, shape, x, y):
        shape.x = x
        shape.y = y
        shape.save(update_fields=["x", "y"])

    def _validate_move_payload(self, payload):
        required = ["id", "x", "y"]
        if not all(key in payload for key in required):
            return False

        try:
            int(payload["id"])
            float(payload["x"])
            float(payload["y"])
            return True
        except (TypeError, ValueError):
            return False
