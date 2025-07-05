from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework import permissions
from rest_framework.viewsets import ModelViewSet
from .models import Map, GameSession, PlayerInSession
from .serializers import MapSerializer
from .models import Map, Room, Shape, User, GameSession, PlayerInSession, Spell, CharacterClass, Race, Item
from .serializers import (
    MapSerializer,
    RoomSerializer,
    ShapeSerializer,
    ShapeImageSerializer,
    PointOfInterestSerializer,
    SpellSerializer,
    CharacterClassSerializer,
    RaceSerializer,
    ItemSerializer
)

from .models import Attack
from .serializers import AttackSerializer

# ==================== Map Views ====================
class MapViewSet(ModelViewSet):
    queryset = Map.objects.all()
    serializer_class = MapSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        if obj.user == user:
            return obj

        if PlayerInSession.objects.filter(session__map=obj, user=user).exists():
            return obj

        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Нет доступа к этой карте.")

    def retrieve(self, request, *args, **kwargs):
        map_instance = self.get_object()
        serializer = self.get_serializer(map_instance)

        # Загружаем все фигуры, которые находятся на этой карте прямо сейчас
        session_shapes = Shape.objects.filter(current_map=map_instance)

        # Сериализуем фигуры
        session_shapes_data = ShapeSerializer(session_shapes, many=True).data

        response_data = serializer.data
        response_data['session_shapes'] = session_shapes_data  # 👈 Это поле обязательно

        return Response(response_data)



class MapDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        print(f"DEBUG: Пытаюсь найти карту с ID: {pk}")
        exists = Map.objects.filter(pk=pk).exists()
        print(f"DEBUG: Карта с ID {pk} существует? {exists}")

        if not exists:
            print("DEBUG: Карта не найдена.")
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        map_instance = Map.objects.get(pk=pk)
        print(f"DEBUG: Карта найдена: {map_instance}")

        serializer = MapSerializer(map_instance)
        print(f"DEBUG: Сериализованные данные: {serializer.data}")
        return Response(serializer.data)

    def post(self, request, pk):
        print("DEBUG: Получены данные на создание:", request.data)

        serializer = MapSerializer(data=request.data)
        if serializer.is_valid():
            print("DEBUG: Данные валидны, создаём карту...")
            user = get_object_or_404(User, pk=pk)
            serializer.save(user=user)
            print("DEBUG: Карта успешно создана:", serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print("DEBUG: Ошибки валидации:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        print(f"DEBUG: Пытаемся обновить карту с ID: {pk}")
        print("DEBUG: Получены данные на обновление:", request.data)

        map_instance = get_object_or_404(Map, pk=pk, user=request.user)
        print(f"DEBUG: Карта найдена для обновления: {map_instance}")

        serializer = MapSerializer(map_instance, data=request.data)
        if serializer.is_valid():
            print("DEBUG: Данные валидны, сохраняем изменения...")
            serializer.save()
            print("DEBUG: Карта успешно обновлена:", serializer.data)

            # 📡 WebSocket-рассылка новой фигуры
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            channel_layer = get_channel_layer()

            # Если отправили только одну фигуру (твой кейс)
            if 'shapes' in serializer.data and serializer.data['shapes']:
                new_shape = serializer.data['shapes'][-1]  # Последняя добавленная фигура

                print(f"DEBUG: Рассылаем новую фигуру через WebSocket: {new_shape}")

                async_to_sync(channel_layer.group_send)(
                    f"map_{map_instance.id}",
                    {
                        "type": "broadcast_event",
                        "action": "create",
                        "payload": new_shape
                    }
                )

            return Response(serializer.data)

        print("DEBUG: Ошибки валидации при обновлении:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MapUploadImage(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)

        # Проверка прав доступа
        if not (shape.owner == request.user or shape.user == request.user or shape.map.user == request.user):
            return Response({"error": "Нет доступа"}, status=403)

        serializer = ShapeImageSerializer(shape, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"image_url": shape.image.url}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShapeListView(APIView):
    def get(self, request, map_id):
        shapes = Shape.objects.filter(map_id=map_id)
        serializer = ShapeSerializer(shapes, many=True)
        return Response(serializer.data)

class ShapeDetailView(APIView):
    def get(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)
        serializer = ShapeSerializer(shape)
        return Response(serializer.data)
    def patch(self, request, pk):
        shape = Shape.objects.get(pk=pk)
        serializer = ShapeSerializer(shape, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # 📡 WebSocket обновление
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"map_{shape.map_id}",
                {
                    "type": "broadcast_event",
                    "action": "update",
                    "payload": serializer.data,
                }
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        shape = Shape.objects.get(pk=pk)
        shape_id = shape.id
        map_id = shape.map_id
        shape.delete()

        # 📡 WebSocket удаление
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"map_{map_id}",
            {
                "type": "broadcast_event",
                "action": "delete",
                "payload": {"id": shape_id},
            }
        )

        return Response({"detail": "Фигура удалена"})
class ShapeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("DEBUG: Запрос на создание фигуры", request.data)

        serializer = ShapeSerializer(data=request.data)
        if serializer.is_valid():
            shape = serializer.save(user=request.user, owner=request.user)

            # 🔥 Обязательно привязываем current_map
            if not shape.current_map:
                shape.current_map = shape.map
                shape.save(update_fields=['current_map'])

            print(f"DEBUG: Фигура создана: {shape.id}")

            # 📡 Отправляем через WebSocket
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"map_{shape.map_id}",
                {
                    "type": "broadcast_event",
                    "action": "create",
                    "payload": ShapeSerializer(shape).data,
                }
            )

            return Response(ShapeSerializer(shape).data, status=201)

        print("DEBUG: Ошибка при создании фигуры", serializer.errors)
        return Response(serializer.errors, status=400)

# ==================== Room Views ====================
class RoomView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        rooms = Room.objects.filter(map_id=pk, map__user=request.user)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)


class SingleRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        room = get_object_or_404(Room, pk=pk, map__user=request.user)
        serializer = RoomSerializer(room)
        return Response(serializer.data)


class CreateNewRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        map_instance = get_object_or_404(Map, pk=pk, user=request.user)
        data = request.data.copy()
        data['map'] = pk

        serializer = RoomSerializer(data=data)
        if serializer.is_valid():
            serializer.save(map=map_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== Shape Views ====================
class ShapeDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def _check_access(self, shape, user):
        return (
            shape.owner == user or
            shape.user == user or
            (shape.current_map and shape.current_map.user == user)
        )

    def _notify_update(self, shape):
        print("nitifying")
        channel_layer = get_channel_layer()

        if shape.current_map_id:
            group = f"map_{shape.current_map_id}"
        else:
            group = "map_global"

        async_to_sync(channel_layer.group_send)(
            group,
            {
                "type": "broadcast_event",
                "action": "update",
                "payload": ShapeSerializer(shape).data
            }
        )
    def get(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)
        if not self._check_access(shape, request.user):
            return Response({"detail": "Нет доступа"}, status=403)
        serializer = ShapeSerializer(shape)
        return Response(serializer.data)

    def put(self, request, pk):
        print("📦 Пришедшие данные:", request.data)
        shape = get_object_or_404(Shape, pk=pk)
        if not self._check_access(shape, request.user):
            return Response({"detail": "Нет доступа"}, status=403)

        # Универсальная подгрузка данных
        shape_data = request.data.get('shapes')
        print(shape_data)
        if isinstance(shape_data, list) and shape_data:
            shape_data = shape_data[0]
        else:
            shape_data = request.data

        serializer = ShapeSerializer(shape, data=shape_data)

        if serializer.is_valid():
            print(f"DEBUG: Данные после валидации: {serializer.validated_data}")
            serializer.save()
            self._notify_update(shape)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)
        if not self._check_access(shape, request.user):
            return Response({"detail": "Нет доступа"}, status=403)

        shape_data = request.data.get('shapes', [request.data])[0]
        serializer = ShapeSerializer(shape, data=shape_data, partial=True)

        if serializer.is_valid():
            print(f"DEBUG: Данные после валидации: {serializer.validated_data}")
            serializer.save()
            self._notify_update(shape)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)
        if not self._check_access(shape, request.user):
            return Response({"detail": "Нет доступа"}, status=403)

        shape.delete()
        return Response({"detail": "Shape deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class EntityEditing(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)
        serializer = ShapeSerializer(shape, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)
        serializer = ShapeSerializer(shape)
        return Response(serializer.data)


# ==================== Game Session Views ====================
class CreateURLView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        map_instance = get_object_or_404(Map, pk=pk, user=request.user)

        # Обновление последней открытой комнаты
        if last_room_id := request.data.get('last_opened_room_id'):
            map_instance.last_opened_room_id = last_room_id
            map_instance.save()

        session = GameSession.objects.create(
            map=map_instance,
            owner=request.user,
            name="Сессия"
        )

        return Response({
            "session_id": str(session.id),
            "join_url": f'http://localhost:3000/join/{session.id}/',
            "session_players": [user.username for user in session.players.all()]
        })


class JoinGameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(GameSession, id=session_id)
        user = request.user

        if user == session.owner:
            return Response({
                "role": "master",
                "map_id": session.map.id
            })

        available_shapes = Shape.objects.filter(owner=user)
        return Response({
            "role": "player",
            "map_id": session.map.id,
            "available_shapes": [{"id": s.id, "name": s.name} for s in available_shapes]
        })


class JoinSessionWithShapeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        print('DEBUG: Попали в JoinSessionWithShapeView')
        print('DEBUG request.data: ', request.data)

        shape_id = request.data.get("shape_id")
        print('DEBUG shape_id: ', shape_id)

        if not shape_id:
            print('DEBUG Ошибка: shape_id не передан')
            return Response({"error": "shape_id обязателен"}, status=400)

        session = get_object_or_404(GameSession, id=session_id)
        print('DEBUG Сессия найдена: ', session)
        user = request.user

        if PlayerInSession.objects.filter(session=session, user=user).exists():
            print('DEBUG Пользователь уже в сессии')
            return Response({"detail": "Вы уже присоединились к этой сессии"}, status=400)

        try:
            shape = Shape.objects.get(id=shape_id)
            print('DEBUG Фигура найдена: ', shape)
        except Shape.DoesNotExist:
            print('DEBUG Фигура не найдена')
            return Response({"detail": "Фигура не найдена"}, status=400)

        if shape.owner != user and shape.user != user:
            print('DEBUG Нет доступа к фигуре')
            return Response({"detail": "Нет доступа"}, status=403)

        shape.owner = user
        shape.current_map = session.map
        shape.save()

        PlayerInSession.objects.create(
            session=session,
            user=user,
            character=shape
        )

        print('DEBUG Успешно присоединились')

        channel_layer = get_channel_layer()

        # Сообщаем мастеру о новом игроке
        async_to_sync(channel_layer.group_send)(
            f"map_{session.map.id}",
            {
                "type": "broadcast_event",
                "action": "session_update",
                "payload": {
                    "detail": "Новый игрок присоединился",
                    "shape_id": shape.id,
                }
            }
        )
        async_to_sync(channel_layer.group_send)(
            f"map_{session.map.id}",
            {
                "type": "broadcast_event",
                "action": "turn_order_update",
                "payload": {
                    "new_shape_id": shape.id,
                }
            }
        )
                # Отправляем фигуру в карту мастера
        async_to_sync(channel_layer.group_send)(
            f"map_{session.map.id}",
            {
                "type": "broadcast_event",
                "action": "create",
                "payload": ShapeSerializer(shape).data,
            }
        )

        return Response({
            "detail": "Успешно присоединились",
            "map_id": session.map.id
        }, status=200)


# ==================== Other Views ====================
class PointOfInterestEditing(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        map_instance = get_object_or_404(Map, pk=pk, user=request.user)
        data = {**request.data, "map": map_instance.id}

        serializer = PointOfInterestSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== Spell Views ====================
class SpellCreateView(generics.CreateAPIView):
    queryset = Spell.objects.all()
    serializer_class = SpellSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class SpellUpdateView(generics.UpdateAPIView):
    queryset = Spell.objects.all()
    serializer_class = SpellSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class SpellDeleteView(generics.DestroyAPIView):
    queryset = Spell.objects.all()
    serializer_class = SpellSerializer
    permission_classes = [permissions.IsAuthenticated]


class SpellByCreatorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        spells = Spell.objects.filter(creator=creator_id)
        serializer = SpellSerializer(spells, many=True)
        return Response(serializer.data)


# ==================== Character Class Views ====================
class ClassCreateView(generics.CreateAPIView):
    queryset = CharacterClass.objects.all()
    serializer_class = CharacterClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Ошибки сериализации:", serializer.errors)
            return Response(serializer.errors, status=400)
        serializer.save(creator=self.request.user)
        return Response(serializer.data, status=201)


class ClassUpdateView(generics.UpdateAPIView):
    queryset = CharacterClass.objects.all()
    serializer_class = CharacterClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class ClassDeleteView(generics.DestroyAPIView):
    queryset = CharacterClass.objects.all()
    serializer_class = CharacterClassSerializer
    permission_classes = [permissions.IsAuthenticated]


class ClassByCreatorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        classes = CharacterClass.objects.filter(creator=creator_id)
        serializer = CharacterClassSerializer(classes, many=True)
        return Response(serializer.data)


# ==================== Race Views ====================

class RaceCreateView(generics.CreateAPIView):
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Ошибки сериализации:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(creator=self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RaceUpdateView(generics.UpdateAPIView):
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class RaceDeleteView(generics.DestroyAPIView):
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    permission_classes = [permissions.IsAuthenticated]


class RaceByCreatorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        races = Race.objects.filter(creator=creator_id)
        serializer = RaceSerializer(races, many=True)
        return Response(serializer.data)


# ==================== Item Views ====================
class ItemCreateView(generics.CreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Ошибки сериализации:", serializer.errors)
            return Response(serializer.errors, status=400)
        serializer.save(creator=self.request.user)
        return Response(serializer.data, status=201)



class ItemUpdateView(generics.UpdateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class ItemDeleteView(generics.DestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

class ItemByCreatorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        try:
            creator_id = int(creator_id)
        except (ValueError, TypeError):
            return Response({"detail": "Invalid creator_id"}, status=400)

        items = Item.objects.filter(creator=creator_id)
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)


class AttackCreateView(generics.CreateAPIView):
    queryset = Attack.objects.all()
    serializer_class = AttackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Ошибки сериализации:", serializer.errors)
            return Response(serializer.errors, status=400)
        serializer.save(creator=self.request.user)  # Явно передаём creator
        return Response(serializer.data, status=201)


class AttackUpdateView(generics.UpdateAPIView):
    queryset = Attack.objects.all()
    serializer_class = AttackSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class AttackDeleteView(generics.DestroyAPIView):
    queryset = Attack.objects.all()
    serializer_class = AttackSerializer
    permission_classes = [permissions.IsAuthenticated]


class AttackByOwnerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        try:
            creator_id = int(creator_id)
        except (ValueError, TypeError):
            return Response({"detail": "Invalid creator_id"}, status=status.HTTP_400_BAD_REQUEST)

        attacks = Attack.objects.filter(creator_id=creator_id)
        serializer = AttackSerializer(attacks, many=True)
        return Response(serializer.data)



class SessionPlayersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        print(f"📥 Запрос на получение игроков сессии: {session_id}")
        session = get_object_or_404(GameSession, id=session_id)
        players = PlayerInSession.objects.filter(session=session).select_related('user', 'character')

        print(f"✅ Найдено игроков: {players.count()}")

        data = []
        for player in players:
            print(f"🎮 Игрок: {player.user.username} — Персонаж: {player.character.name}")
            data.append({
                'username': player.user.username,
                'character': ShapeSerializer(player.character).data
            })

        print(f"✅ Отправляем список игроков: {data}")
        return Response(data)