from rest_framework import serializers
from .models import UserProfile
from maps.serializers import MapSerializer
from maps.models import Shape

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    maps = MapSerializer(source='user.map_set', many=True)  # Используем обратную связь для получения всех карт

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'bio', 'avatar', 'maps']

class EntitySerializer(serializers.ModelSerializer):
        map = MapSerializer()  # вложенный сериализатор
        class Meta:
            model = Shape
            fields = '__all__'