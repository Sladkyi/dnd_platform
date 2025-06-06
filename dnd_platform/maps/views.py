from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

from .models import Map, Room, Shape, User, GameSession, PlayerInSession
from .serializers import (
    MapSerializer,
    ShapeImageSerializer,
    ShapeSerializer,
    RoomSerializer,
    PointOfInterestSerializer
)

class MapViewSet(viewsets.ModelViewSet):
    queryset = Map.objects.all()
    serializer_class = MapSerializer


class JoinGameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(GameSession, id=session_id)
        user = request.user

        # 🧙 Если пользователь — владелец сессии
        if user == session.owner:
            return Response({
                "role": "master",
                "map_id": session.map.id
            })

        # 👤 Если игрок — показать доступные персонажи
        available_shapes = Shape.objects.filter(owner=request.user)

        return Response({
            "role": "player",
            "map_id": session.map.id,
            "available_shapes": [{"id": s.id, "name": s.name} for s in available_shapes]
        })
class JoinSessionWithShapeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        session = get_object_or_404(GameSession, id=session_id)
        user = request.user
        shape_id = request.data.get("shape_id")

        if not shape_id:
            return Response({"error": "shape_id обязателен"}, status=400)

        # Проверка: не присоединялся ли уже
        if PlayerInSession.objects.filter(session=session, user=user).exists():
            return Response({"detail": "Вы уже присоединились к этой сессии"}, status=400)

        shape = get_object_or_404(Shape, id=shape_id)

        if shape.owner and shape.owner != user:
            return Response({"error": "Этот персонаж уже занят"}, status=403)

        # Назначаем владельца персонажу
        shape.owner = user
        shape.save()

        # Создаём связь игрока с сессией
        PlayerInSession.objects.create(
            session=session,
            user=user,
            character=shape
        )

        return Response({
            "detail": "Успешно присоединились",
            "map_id": session.map.id
        }, status=200)

class CreateURLView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        map_instance = get_object_or_404(Map, pk=pk, user=request.user)

        # Обновляем, если пришел ID комнаты
        last_room_id = request.data.get('last_opened_room_id')
        if last_room_id:
            map_instance.last_opened_room_id = last_room_id
            map_instance.save()

        # Создаём игровую сессию
        session = GameSession.objects.create(map=map_instance, owner=request.user, name="Сессия")

        # Генерируем ссылку
        join_url = f'http://localhost:3000/join/{session.id}/'

        return Response({
            "session_id": str(session.id),
            "join_url": join_url,
            "session_players": [user.username for user in session.players.all()]
        })
class PointOfInterestEditing(APIView):
    def post(self, request, pk):
        data = request.data
        print("Полученные данные:", data)

        # Получаем карту по pk
        map_instance = get_object_or_404(Map, pk=pk)

        # Добавляем ID карты в данные
        data['map'] = map_instance.id
        print("Данные с ID карты:", data)

        # Сериализуем данные
        serializer = PointOfInterestSerializer(data=data)

        # Проверяем, что сериализатор валиден
        if serializer.is_valid():
            # Сохраняем и возвращаем созданную точку интереса
            point_of_interest = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # Выводим ошибки сериализации для отладки
            print("Ошибки сериализации:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EntityEditing(APIView):
    def patch(self , request , pk):
        print("patch method entityEditing triggered")
        entity_instance = Shape.objects.get(pk = pk)
        serializer = ShapeSerializer(entity_instance, data=request.data, partial=True)
        if serializer.is_valid():
            print("DATA IS VALID SAVING")
            serializer.save()
            return Response(serializer.data)
        else:
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self , request, pk):
        entity_instance = Shape.objects.get(pk=pk)
        serializer = ShapeSerializer(entity_instance, data=request.data, partial=True)
        if serializer.is_valid():
            return Response(serializer.data)
class MapDetailAPIView(APIView):
    def get(self, request, pk):
        print("GET method triggered for MapDetailAPIView")
        map_instance = Map.objects.get(pk=pk)
        serializer = MapSerializer(map_instance)
        print("Serialized map data:", serializer.data)
        return Response(serializer.data)
    def post(self , request , pk):
        print("POST method triggered. Creating new map >>>")
        serializer = MapSerializer(data=request.data)

        if serializer.is_valid():
            user = get_object_or_404(User, pk=pk)
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, pk):
        print("PUT method triggered for MapDetailAPIView")
        print(request)
        map_instance = Map.objects.get(pk=pk)
        serializer = MapSerializer(map_instance, data=request.data)
        if serializer.is_valid():
            print("Data is valid. Saving...")
            serializer.save()

            return Response(serializer.data)
        else:
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoomView(APIView):
    def get(self, request , pk):
        try:
            rooms = Room.objects.filter(map = pk)
            serializer = RoomSerializer(rooms , many = True)
            return Response(serializer.data , status = status.HTTP_200_OK)
        except Room.DoesNotExist:
            return Response({"error": "Комнаты не найдены"} , status = status.HTTP_404_NOT_FOUND)


class SingleRoomView(APIView):
    def get(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
            serializer = RoomSerializer(room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Room.DoesNotExist:
            return Response({"error": "Комната не найдена"}, status=status.HTTP_404_NOT_FOUND)

class CreateNewRoomView(APIView):
    def post(self, request, pk):
        print("== POST Запрос получен ==")
        print("Request data:", request.data)  # Вывод данных запроса
        data = request.data.copy()
        data['map'] = pk

        # Передаем request в контексте сериализатора
        serializer = RoomSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            # Сохраняем комнату (включая изображение)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # В случае ошибки валидации, возвращаем ошибки с кодом 400
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ShapeDetailAPIView(APIView):
    def put(self, request, pk):
        try:
            # Получение фигуры по ID
            shape = Shape.objects.get(pk=pk)
            print(f"Before update - Shape ID: {shape.id}, x: {shape.x}, y: {shape.y}, fill: {shape.fill}")

            # Печать данных, полученных от клиента
            print(f"DATA from user {request.data}")

            # Извлекаем данные для обновления из запроса
            shape_data = request.data['shapes'][0]  # Предполагаем, что передаётся один объект в списке shapes
            # Обновляем все обязательные поля
            shape.type = shape_data.get('type', shape.type)  # Если поле type не передано, оставляем старое значение
            shape.x = shape_data.get('x', shape.x)          # Обновляем координату x
            shape.y = shape_data.get('y', shape.y)          # Обновляем координату y
            shape.fill = shape_data.get('fill', shape.fill) # Обновляем цвет заливки

            # Дополнительная проверка, если нужно, чтобы атрибуты точно обновлялись
            print(f"Updating Shape with new values: type = {shape.type}, x = {shape.x}, y = {shape.y}, fill = {shape.fill}")

            shape.save()  # Сохраняем изменения в базе данных

            # После обновления, выводим обновлённые данные
            print(f"Updated Shape ID: {shape.id}, x: {shape.x}, y: {shape.y}, fill: {shape.fill}")

            # Возвращаем обновлённые данные
            return Response(ShapeSerializer(shape).data, status=status.HTTP_200_OK)
        except Shape.DoesNotExist:
            print(f"Shape with ID {pk} not found.")
            return Response({"detail": "Shape not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            shape = Shape.objects.get(pk=pk)
            print(f"PATCH — updating shape {pk} with data:", request.data)
            shape_data = request.data.get('shapes', [request.data])[0]

            serializer = ShapeSerializer(shape, data=shape_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                print("Validation errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Shape.DoesNotExist:
            print(f"Shape with ID {pk} not found.")
            return Response({"detail": "Shape not found"}, status=status.HTTP_404_NOT_FOUND)
    def delete(self, request, pk):
        try:
            shape = Shape.objects.get(pk=pk)
            print(f"Deleting Shape ID: {shape.id}")

            # Удаляем фигуру
            shape.delete()

            # Возвращаем успешный ответ
            return Response({"detail": "Shape deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Shape.DoesNotExist:
            print(f"Shape with ID {pk} not found.")
            return Response({"detail": "Shape not found"}, status=status.HTTP_404_NOT_FOUND)








class MapUploadImage(APIView):

    def post(self, request, pk):
        print(request.data)
        try:
            shape_instance = Shape.objects.get(pk=pk)
        except Shape.DoesNotExist:
            return Response({"error": "Фигура не найдена"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ShapeImageSerializer(shape_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Изображение успешно загружено",
                "image_url": shape_instance.image.url,
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




