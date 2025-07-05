from rest_framework import serializers
from .models import UserProfile
from maps.serializers import MapSerializer
from maps.models import Shape

class UserProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    maps = MapSerializer(source='user.map_set', many=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user_id', 'username', 'bio', 'avatar', 'maps']

class EntitySerializer(serializers.ModelSerializer):
    map = MapSerializer(read_only=True, allow_null=True)  # вложенный сериализатор

    class Meta:
        model = Shape
        fields = '__all__'

