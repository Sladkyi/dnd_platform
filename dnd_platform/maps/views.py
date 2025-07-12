from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import UpdateAPIView
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import CreateAPIView
from django.db import models
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
# Модели
from .models import Map, GameSession, PlayerInSession, Room, Shape, User, Spell, CharacterClass, Race, Item, Attack, ItemInstance, MapPointImage
from .models import MapPoint
# Сериализаторы
from .serializers import (
    MapSerializer, RoomSerializer, ShapeSerializer, ShapeImageSerializer,
    SpellSerializer, CharacterClassSerializer,
    RaceSerializer, ItemSerializer, AttackSerializer, ItemInstanceSerializer , MapPointSerializer
)
from django.forms.models import model_to_dict
import json
# ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

def broadcast_shape_update(shape, action):
    """Отправляет обновление фигуры через WebSocket"""
    channel_layer = get_channel_layer()
    group_name = f"map_{shape.current_map_id}" if shape.current_map_id else "map_global"
    
    payload = {
        "type": "broadcast_event",
        "action": action,
        "payload": ShapeSerializer(shape).data if action != "delete" else {"id": shape.id}
    }
    
    async_to_sync(channel_layer.group_send)(group_name, payload)

# ==================== КАРТЫ (MAPS) ====================

class MapViewSet(ModelViewSet):
    """
    ViewSet для полного цикла работы с картами (CRUD операции)
    - Создание, чтение, обновление и удаление карт
    - Проверка прав доступа пользователя
    - Возвращает данные карты с фигурами при запросе
    """
    queryset = Map.objects.all()
    serializer_class = MapSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(
            models.Q(user=user) |
            models.Q(id__in=PlayerInSession.objects.filter(user=user).values_list('session__map_id', flat=True))
        )

    def get_object(self):
        """Проверяет права доступа к конкретной карте"""
        obj = super().get_object()
        user = self.request.user

        # Доступ есть у владельца и участников сессии
        if obj.user == user:
            return obj

        if PlayerInSession.objects.filter(session__map=obj, user=user).exists():
            return obj

        raise PermissionDenied("Нет доступа к этой карте.")

    def retrieve(self, request, *args, **kwargs):
        """Возвращает данные карты со всеми активными фигурами"""
        map_instance = self.get_object()
        serializer = self.get_serializer(map_instance)

        # Получаем все фигуры на текущей карте
        session_shapes = Shape.objects.filter(current_map=map_instance)
        session_shapes_data = ShapeSerializer(session_shapes, many=True).data

        response_data = serializer.data
        response_data['session_shapes'] = session_shapes_data
        return Response(response_data)


class MapDetailAPIView(APIView):
    """Детальное управление картой через API (GET/POST/PUT)"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Получение детальной информации о карте"""
        map_instance = get_object_or_404(Map, pk=pk)
        
        # Проверка прав доступа
        if not (map_instance.user == request.user or 
                PlayerInSession.objects.filter(session__map=map_instance, user=request.user).exists()):
            return Response({"detail": "Нет доступа"}, status=403)
        
        serializer = MapSerializer(map_instance)
        return Response(serializer.data)

    def post(self, request, pk):
        """Создание новой карты"""
        serializer = MapSerializer(data=request.data)
        if serializer.is_valid():
            user = get_object_or_404(User, pk=pk)
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        """Обновление существующей карты"""
        map_instance = get_object_or_404(Map, pk=pk, user=request.user)
        serializer = MapSerializer(map_instance, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MapUploadImage(APIView):
    """Загрузка изображения для фигуры на карте"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)
        
        # Проверка прав доступа
        if not (shape.owner == request.user or 
                shape.user == request.user or 
                shape.map.user == request.user):
            return Response({"error": "Нет доступа"}, status=403)

        serializer = ShapeImageSerializer(shape, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"image_url": shape.image.url}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== ФИГУРЫ (SHAPES) ====================

class ShapeListView(APIView):
    """Получение списка фигур для конкретной карты"""
    def get(self, request, map_id):
        shapes = Shape.objects.filter(map_id=map_id)
        serializer = ShapeSerializer(shapes, many=True)
        return Response(serializer.data)


class ShapeDetailView(APIView):
    """Детальное управление отдельной фигурой"""
    def get(self, request, pk):
        shape = get_object_or_404(Shape, pk=pk)
        serializer = ShapeSerializer(shape)
        return Response(serializer.data)

    def patch(self, request, pk):
        """Частичное обновление фигуры"""
        shape = Shape.objects.get(pk=pk)
        serializer = ShapeSerializer(shape, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            broadcast_shape_update(shape, "update")
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        """Удаление фигуры"""
        shape = Shape.objects.get(pk=pk)
        shape_id = shape.id
        map_id = shape.map_id
        shape.delete()
        
        # Отправка события удаления через WebSocket
        broadcast_shape_update(shape, "delete")
        return Response({"detail": "Фигура удалена"})


class ShapeCreateView(APIView):
    """Создание новой фигуры"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ShapeSerializer(data=request.data)
        if serializer.is_valid():
            shape = serializer.save(user=request.user, owner=request.user)
            
            # Привязка к текущей карте
            if not shape.current_map:
                shape.current_map = shape.map
                shape.save(update_fields=['current_map'])
            print("🧾 Shape создан пользователем:", request.user.id)
            print("🧾 Owner ID:", shape.owner_id)
            print("🧾 Current WS-пользователь будет сравниваться с этим ID")
            # Отправка события создания через WebSocket
            broadcast_shape_update(shape, "create")
            return Response(ShapeSerializer(shape).data, status=201)
        return Response(serializer.errors, status=400)


EXCLUDED_FIELDS = {
    'id', 'pk', 'created_at', 'updated_at',
    'user', 'owner', 'current_map', 'map',
    'inventory', 'spells', 'attacks', 'image',
}

def clone_shape(original: Shape, overrides: dict = None) -> Shape:
    overrides = overrides or {}

    original_dict = model_to_dict(original)

    # Удаляем поля, которые нельзя копировать напрямую
    for field in EXCLUDED_FIELDS:
        original_dict.pop(field, None)

    # Подставляем FK-объекты, а не id
    if original.race:
        original_dict['race'] = original.race
    if original.character_class:
        original_dict['character_class'] = original.character_class
    if original.head_slot:
        original_dict['head_slot'] = original.head_slot
    if original.body_slot:
        original_dict['body_slot'] = original.body_slot
    if original.weapon_slot:
        original_dict['weapon_slot'] = original.weapon_slot

    # Объединяем с overrides (всё, что передано вручную)
    clone_data = {
        **original_dict,
        'is_clone': True,
        **overrides
    }

    # Создание клона
    clone = Shape.objects.create(**clone_data)

    # Копирование M2M-полей
    clone.spells.set(original.spells.all())
    clone.attacks.set(original.attacks.all())

    return clone


class ShapeDetailAPIView(APIView):
    """Расширенное управление фигурами (GET/PUT/PATCH/DELETE)"""
    permission_classes = [IsAuthenticated]

    def _check_access(self, shape, user):
        """Проверка прав доступа к фигуре"""
        return (
            shape.owner == user or
            shape.user == user or
            (shape.current_map and shape.current_map.user == user)
        )

    def get(self, request, pk):
        """Получение детальной информации о фигуре"""
        shape = get_object_or_404(Shape, pk=pk)
        if not self._check_access(shape, request.user):
            return Response({"detail": "Нет доступа"}, status=403)
        serializer = ShapeSerializer(shape)
        return Response(serializer.data)

    def put(self, request, pk):
        """Полное обновление фигуры"""
        shape = get_object_or_404(Shape, pk=pk)
        if not self._check_access(shape, request.user):
            return Response({"detail": "Нет доступа"}, status=403)
        
        # Обработка данных
        shape_data = request.data.get('shapes')
        if isinstance(shape_data, list) and shape_data:
            shape_data = shape_data[0]
        else:
            shape_data = request.data

        serializer = ShapeSerializer(shape, data=shape_data)
        if serializer.is_valid():
            serializer.save()
            broadcast_shape_update(shape, "update")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Частичное обновление фигуры"""
        shape = get_object_or_404(Shape, pk=pk)
        
        print("🔍 Запрос на обновление фигуры с ID:", pk)
        print("🔍 Данные запроса (сырые):", request.data)

        if not self._check_access(shape, request.user):
            print("🚫 Ошибка доступа для пользователя", request.user)
            return Response({"detail": "Нет доступа"}, status=403)

        shape_data = request.data.get('shapes', [request.data])[0]
        print("🔍 Данные, поступающие в сериализатор:", shape_data)

        serializer = ShapeSerializer(shape, data=shape_data, partial=True)

        if serializer.is_valid():
            serializer.save()
            print("✅ Фигура успешно обновлена:", serializer.data)
            broadcast_shape_update(shape, "update")
            return Response(serializer.data)

        print("❌ Ошибки сериализации при обновлении фигуры:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk):
        """Удаление фигуры"""
        shape = get_object_or_404(Shape, pk=pk)
        if not self._check_access(shape, request.user):
            return Response({"detail": "Нет доступа"}, status=403)
        
        shape.delete()
        broadcast_shape_update(shape, "delete")
        return Response({"detail": "Фигура удалена"}, status=status.HTTP_204_NO_CONTENT)


class EntityEditing(APIView):
    """Упрощенное редактирование сущностей (фигур)"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        """Частичное обновление сущности"""
        shape = get_object_or_404(Shape, pk=pk)
        serializer = ShapeSerializer(shape, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk):
        """Получение информации о сущности"""
        shape = get_object_or_404(Shape, pk=pk)
        serializer = ShapeSerializer(shape)
        return Response(serializer.data)
class ShapeCloneView(APIView):
    def post(self, request):
        shape_id = request.data.get('shape_id')
        map_id = request.data.get('map_id')
        x = request.data.get('x')
        y = request.data.get('y')
        room_id = request.data.get('room_id')

        if not all([shape_id, map_id, x, y]):
            return Response({'error': 'Missing required fields'}, status=400)

        try:
            original = Shape.objects.get(id=shape_id)
        except Shape.DoesNotExist:
            return Response({'error': 'Shape not found'}, status=404)

        try:
            room = Room.objects.get(id=room_id) if room_id else None
        except Room.DoesNotExist:
            return Response({'error': 'Room not found'}, status=404)

        clone = clone_shape(
            original,
            overrides={
                'name': f"{original.name} (копия)" if original.name else "Клон",
                'x': x,
                'y': y,
                'map_id': map_id,
                'current_map_id': map_id,
                'user_id': original.user_id,
                'room': room,
            }
        )

        return Response(ShapeSerializer(clone).data, status=201)
# ==================== КОМНАТЫ (ROOMS) ====================

class RoomView(APIView):
    """Получение списка комнат для карты"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        rooms = Room.objects.filter(map_id=pk, map__user=request.user)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)


class SingleRoomView(APIView):
    """Детальная информация об отдельной комнате"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        room = get_object_or_404(Room, pk=pk)
        
        # Проверка прав доступа
        is_owner = room.map.user == request.user
        is_player = PlayerInSession.objects.filter(
            session__map=room.map, user=request.user
        ).exists()

        if not is_owner and not is_player:
            return Response({"detail": "Нет доступа к этой комнате."}, status=403)

        serializer = RoomSerializer(room)
        return Response(serializer.data)


class CreateNewRoomView(CreateAPIView):
    """Создание новой комнаты"""
    permission_classes = [IsAuthenticated]
    serializer_class = RoomSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        map_instance = get_object_or_404(Map, pk=self.kwargs['pk'], user=self.request.user)
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(map=map_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== ИГРОВЫЕ СЕССИИ ====================

class CreateURLView(APIView):
    """Создание игровой сессии и URL для присоединения"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        map_instance = get_object_or_404(Map, pk=pk, user=request.user)

        # Обновление последней открытой комнаты
        if last_room_id := request.data.get('last_opened_room_id'):
            map_instance.last_opened_room_id = last_room_id
            map_instance.save()

        # Создание новой игровой сессии
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
    """Присоединение к игровой сессии"""
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(GameSession, id=session_id)
        user = request.user

        # Определение роли пользователя
        if user == session.owner:
            return Response({"role": "master", "map_id": session.map.id})

        # Возвращаем доступные фигуры для игрока
        available_shapes = Shape.objects.filter(owner=user)
        return Response({
            "role": "player",
            "map_id": session.map.id,
            "available_shapes": [{"id": s.id, "name": s.name} for s in available_shapes]
        })


class JoinSessionWithShapeView(APIView):
    """Присоединение к сессии с использованием конкретной фигуры"""
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        shape_id = request.data.get("shape_id")
        if not shape_id:
            return Response({"error": "shape_id обязателен"}, status=400)

        session = get_object_or_404(GameSession, id=session_id)
        user = request.user

        # Проверка, не присоединился ли уже пользователь
        if PlayerInSession.objects.filter(session=session, user=user).exists():
            return Response({"detail": "Вы уже присоединились к этой сессии"}, status=400)

        # Получение и проверка фигуры
        shape = get_object_or_404(Shape, id=shape_id)
        if shape.owner != user and shape.user != user:
            return Response({"detail": "Нет доступа к фигуре"}, status=403)

        # Обновление фигуры
        shape.owner = user
        shape.current_map = session.map
        shape.save()

        # Создание связи игрока с сессией
        PlayerInSession.objects.create(session=session, user=user, character=shape)

        # Отправка уведомлений через WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"map_{session.map.id}",
            {
                "type": "broadcast_event",
                "action": "session_update",
                "payload": {"detail": "Новый игрок присоединился", "shape_id": shape.id}
            }
        )
        
        async_to_sync(channel_layer.group_send)(
            f"map_{session.map.id}",
            {
                "type": "broadcast_event",
                "action": "turn_order_update",
                "payload": {"new_shape_id": shape.id}
            }
        )
        
        async_to_sync(channel_layer.group_send)(
            f"map_{session.map.id}",
            {
                "type": "broadcast_event",
                "action": "create",
                "payload": ShapeSerializer(shape).data
            }
        )

        return Response({
            "detail": "Успешно присоединились",
            "map_id": session.map.id
        }, status=200)


class SessionPlayersView(APIView):
    """Получение списка игроков в сессии"""
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(GameSession, id=session_id)
        players = PlayerInSession.objects.filter(session=session).select_related('user', 'character')

        data = []
        for player in players:
            data.append({
                'username': player.user.username,
                'character': ShapeSerializer(player.character).data
            })

        return Response(data)


# ==================== ТОЧКИ ИНТЕРЕСА (POI) ====================

class PointOfInterestViewSet(viewsets.ModelViewSet):
    queryset = MapPoint.objects.all()
    serializer_class = MapPointSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MapPoint.objects.filter(map__user=self.request.user)

    def perform_create(self, serializer):
        map_id = self.request.data.get('map')
        map_instance = get_object_or_404(Map, pk=map_id, user=self.request.user)
        serializer.save(map=map_instance)

    def perform_update(self, serializer):
        instance = serializer.save()

        # Обновление порядка
        images_order = self.request.data.get('images_order')
        if images_order:
            for img in json.loads(images_order):
                MapPointImage.objects.filter(id=img['id'], point=instance).update(order=img['order'])

        # Удаление
        deleted = self.request.data.get('deleted_images')
        if deleted:
            MapPointImage.objects.filter(id__in=json.loads(deleted), point=instance).delete()

        # Новые изображения
        for file in self.request.FILES.getlist('new_images'):
            MapPointImage.objects.create(point=instance, image=file, order=instance.images.count())

        # Главное изображение
        if 'image' in self.request.FILES:
            instance.image = self.request.FILES['image']
            instance.save()
    

# ==================== ЗАКЛИНАНИЯ (SPELLS) ====================

class SpellCreateView(generics.CreateAPIView):
    """Создание заклинаний"""
    queryset = Spell.objects.all()
    serializer_class = SpellSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class SpellUpdateView(generics.UpdateAPIView):
    """Обновление заклинаний"""
    queryset = Spell.objects.all()
    serializer_class = SpellSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class SpellDeleteView(generics.DestroyAPIView):
    """Удаление заклинаний"""
    queryset = Spell.objects.all()
    serializer_class = SpellSerializer
    permission_classes = [permissions.IsAuthenticated]


class SpellByCreatorView(APIView):
    """Получение заклинаний по создателю"""
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        spells = Spell.objects.filter(creator=creator_id)
        serializer = SpellSerializer(spells, many=True)
        return Response(serializer.data)


# ==================== КЛАССЫ ПЕРСОНАЖЕЙ ====================

class ClassCreateView(generics.CreateAPIView):
    """Создание классов персонажей"""
    queryset = CharacterClass.objects.all()
    serializer_class = CharacterClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(creator=self.request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ClassUpdateView(generics.UpdateAPIView):
    """Обновление классов персонажей"""
    queryset = CharacterClass.objects.all()
    serializer_class = CharacterClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class ClassDeleteView(generics.DestroyAPIView):
    """Удаление классов персонажей"""
    queryset = CharacterClass.objects.all()
    serializer_class = CharacterClassSerializer
    permission_classes = [permissions.IsAuthenticated]


class ClassByCreatorView(APIView):
    """Получение классов по создателю"""
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        classes = CharacterClass.objects.filter(creator=creator_id)
        serializer = CharacterClassSerializer(classes, many=True)
        return Response(serializer.data)


# ==================== РАСЫ (RACES) ====================

class RaceCreateView(generics.CreateAPIView):
    """Создание рас"""
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(creator=self.request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class RaceUpdateView(generics.UpdateAPIView):
    """Обновление рас"""
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class RaceDeleteView(generics.DestroyAPIView):
    """Удаление рас"""
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    permission_classes = [permissions.IsAuthenticated]


class RaceByCreatorView(APIView):
    """Получение рас по создателю"""
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        races = Race.objects.filter(creator=creator_id)
        serializer = RaceSerializer(races, many=True)
        return Response(serializer.data)


# ==================== ПРЕДМЕТЫ (ITEMS) ====================

class ItemCreateView(generics.CreateAPIView):
    """Создание предметов"""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(creator=self.request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ItemUpdateView(generics.UpdateAPIView):
    """Обновление предметов"""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class ItemDeleteView(generics.DestroyAPIView):
    """Удаление предметов"""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class ItemByCreatorView(APIView):
    """Получение предметов по создателю"""
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        try:
            creator_id = int(creator_id)
        except (ValueError, TypeError):
            return Response({"detail": "Invalid creator_id"}, status=400)

        items = Item.objects.filter(creator=creator_id)
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)


class ItemByMapView(APIView):
    """Получение предметов по карте"""
    permission_classes = [IsAuthenticated]

    def get(self, request, map_id):
        """
        Получает все предметы, связанные с указанной картой
        
        Args:
            map_id (int): ID карты для фильтрации предметов
            
        Returns:
            Response: Список предметов в формате JSON или сообщение об ошибке
        """
        try:
            # Получаем предметы, связанные с картой
            items = Item.objects.filter(map__id=map_id)
            
            # Сериализуем данные
            serializer = ItemSerializer(items, many=True)
            
            # Возвращаем успешный ответ
            return Response(serializer.data)
        
        except Exception as e:
            # Обработка ошибок с возвратом понятного сообщения
            return Response(
                {'error': f'Ошибка при получении предметов: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ==================== АТАКИ (ATTACKS) ====================

class AttackCreateView(generics.CreateAPIView):
    """Создание атак"""
    queryset = Attack.objects.all()
    serializer_class = AttackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(creator=self.request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class AttackUpdateView(generics.UpdateAPIView):
    """Обновление атак"""
    queryset = Attack.objects.all()
    serializer_class = AttackSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'


class AttackDeleteView(generics.DestroyAPIView):
    """Удаление атак"""
    queryset = Attack.objects.all()
    serializer_class = AttackSerializer
    permission_classes = [permissions.IsAuthenticated]


class AttackByOwnerView(APIView):
    """Получение атак по владельцу"""
    permission_classes = [IsAuthenticated]

    def get(self, request, creator_id):
        try:
            creator_id = int(creator_id)
        except (ValueError, TypeError):
            return Response({"detail": "Invalid creator_id"}, status=400)

        attacks = Attack.objects.filter(creator_id=creator_id)
        serializer = AttackSerializer(attacks, many=True)
        return Response(serializer.data)





class ItemInstanceViewSet(viewsets.ModelViewSet):
    queryset = ItemInstance.objects.all()
    serializer_class = ItemInstanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        item_instance = serializer.save()

        # WebSocket событие
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"map_{item_instance.map_id}",
            {
                "type": "broadcast_event",
                "action": "item_create",
                "payload": ItemInstanceSerializer(item_instance).data,
            }
        )

    def perform_update(self, serializer):
        item_instance = serializer.save()

        # WebSocket событие
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"map_{item_instance.map_id}",
            {
                "type": "broadcast_event",
                "action": "item_update",
                "payload": ItemInstanceSerializer(item_instance).data,
            }
        )

    def perform_destroy(self, instance):
        map_id = instance.map_id
        item_id = instance.id
        instance.delete()

        # WebSocket событие
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"map_{map_id}",
            {
                "type": "broadcast_event",
                "action": "item_delete",
                "payload": {"id": item_id},
            }
        )


class ItemInstanceByMapView(APIView):
    """Получение всех экземпляров предметов на карте"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, map_id):
        try:
            map_instance = Map.objects.get(pk=map_id)

            # Проверка доступа
            if not (map_instance.user == request.user or
                    PlayerInSession.objects.filter(session__map=map_instance, user=request.user).exists()):
                return Response({"detail": "Нет доступа к этой карте"}, status=403)

            items = ItemInstance.objects.filter(map=map_instance)
            serializer = ItemInstanceSerializer(items, many=True)
            return Response(serializer.data)

        except Map.DoesNotExist:
            return Response({"detail": "Карта не найдена"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class ItemInstanceByRoomView(APIView):
    """Получение всех экземпляров предметов в конкретной комнате"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, map_id, room_id):
        try:
            map_instance = Map.objects.get(pk=map_id)
            room_instance = Room.objects.get(pk=room_id)

            # Проверка доступа
            if map_instance.user != request.user:
                return Response({"detail": "Нет доступа к этой карте"}, status=403)

            items = ItemInstance.objects.filter(map=map_instance, room=room_instance)
            serializer = ItemInstanceSerializer(items, many=True)
            return Response(serializer.data)

        except (Map.DoesNotExist, Room.DoesNotExist):
            return Response({"detail": "Карта или комната не найдены"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)