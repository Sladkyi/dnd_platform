import json
import logging
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, viewsets, permissions
from .models import UserProfile
from .serializers import UserProfileSerializer, EntitySerializer
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from maps.models import Shape


logger = logging.getLogger(__name__)


class CheckConn(APIView):
    def get(self, request):
        if request.method == 'GET':
            return JsonResponse({'success': True, 'message': 'Соединение установлено.'})


from rest_framework_simplejwt.tokens import RefreshToken

class UserMap(APIView):
    def get(self , map_id):
        try:
            if map_id is not None:
                logger.info(f'Retrieving map with ID {map_id}.')
                print('there is map_id' +map_id)
                return JsonResponse({'success': True, 'map_id': map_id})

            return JsonResponse({'error': 'map_id is required'}, status=400)

        except json.JSONDecodeError:
            print('error 1')
            logger.error('Invalid JSON received.')
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            print('error 2')
            logger.error(f'An error occurred: {str(e)}')
            return JsonResponse({'error': 'An unexpected error occurred'}, status=500)

class UserEntities(APIView):
    def get(self, request, pk):
        print("get user entities")
        try:
            # Получаем всех персонажей, где пользователь — владелец
            entities = Shape.objects.filter(owner__id=pk)
            serializer = EntitySerializer(entities, many=True)
            return Response(serializer.data)
        except Exception as e:
            print("error", str(e))
            return Response({"error": str(e)}, status=500)

class LoginProfile(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                token = RefreshToken.for_user(user)
                logger.info(f'User {username} logged in successfully.')
                return JsonResponse({
                    'success': True,
                    'token': str(token.access_token),  # Возвращаем токен
                    'message': 'Успешный вход!'
                })
            else:
                logger.warning(f'Failed login attempt for user {username}.')
                return JsonResponse({'success': False, 'message': 'Неверный логин или пароль.'}, status=401)
        except json.JSONDecodeError:
            logger.error('Invalid JSON format received for login.')
            return JsonResponse({'success': False, 'message': 'Неверный формат данных.'}, status=400)


class UserProfileDetail(generics.RetrieveAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user.userprofile


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
