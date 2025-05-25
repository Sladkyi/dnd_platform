from rest_framework import serializers
from .models import Map, Shape , Room , MapPoint
import logging

logger = logging.getLogger(__name__)

class ShapeSerializer(serializers.ModelSerializer):
    # Объявляем поля вне класса Meta
    x = serializers.FloatField(required=False)
    y = serializers.FloatField(required=False)
    type = serializers.CharField(required=False)  # Замените тип на актуальный для поля "type"

    class Meta:
        model = Shape
        exclude = ['map']  # Исключаем поле 'map', чтобы его не передавали из клиента

    def save(self, **kwargs):
        instance = super().save(**kwargs)
        print(f"Shape saved with ID: {instance.id}, x: {instance.x}, y: {instance.y}, fill: {instance.fill}")
        return instance

class PointOfInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapPoint
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'map', 'name', 'background_image', 'description', 'order']
        read_only_fields = ['id']

    def create(self, validated_data):
        return super().create(validated_data)


class MapSerializer(serializers.ModelSerializer):
    shapes = ShapeSerializer(many=True, required=False)
    pointsOfInterest = PointOfInterestSerializer(source='points', many=True, required=False)
    class Meta:
        model = Map
        exclude = ["image"]

    def create(self, validated_data):
        try:
            logger.info("Starting MapSerializer.create()")
            shapes_data = validated_data.pop('shapes', [])
            map_instance = Map.objects.create(**validated_data)
            logger.info(f"Map created with ID: {map_instance.id}")
            if shapes_data:
                Shape.objects.bulk_create(
                    [Shape(map=map_instance, **shape_data) for shape_data in shapes_data]
                )
                logger.info(f"Shapes created successfully: {len(shapes_data)} shapes")
            return map_instance
        except Exception as e:
            logger.error(f"Error in MapSerializer.create(): {e}")
            raise serializers.ValidationError(f"Failed to create Map: {str(e)}")

    def update(self, instance, validated_data):
        try:
            logger.info("Starting MapSerializer.update()")
            shapes_data = validated_data.pop('shapes', [])
            instance.title = validated_data.get('title', instance.title)
            instance.description = validated_data.get('description', instance.description)
            instance.image = validated_data.get('image', instance.image)
            instance.last_opened_room_id = validated_data.get('last_opened_room_id', instance.last_opened_room_id)
            instance.save()
            logger.info(f"Updated map with ID: {instance.id}")

            # Обновление фигур
            existing_shapes = {shape.id: shape for shape in Shape.objects.filter(map=instance)}
            logger.info(f"Existing shapes: {list(existing_shapes.keys())}")

            updated_shape_ids = []
            new_shapes = []

            for shape_data in shapes_data:

                shape_id = shape_data.get('id')
                if shape_id and shape_id in existing_shapes:
                    shape_instance = existing_shapes[shape_id]
                    updated = False
                    for attr, value in shape_data.items():
                        if getattr(shape_instance, attr) != value:  # Only update if value changes
                            setattr(shape_instance, attr, value)
                            updated = True
                    if updated:
                        updated_shape_ids.append(shape_id)
                else:
                    new_shapes.append(Shape(map=instance, **shape_data))

            # Сохранение изменений для существующих фигур
            if updated_shape_ids:
                Shape.objects.bulk_update(
                    [existing_shapes[shape_id] for shape_id in updated_shape_ids],
                    fields=['x', 'y', 'rotation', 'fill', 'stroke', 'stroke_width']
                )
                logger.info(f"Updated shapes with IDs: {updated_shape_ids}")

            # Сохранение новых фигур
            if new_shapes:
                Shape.objects.bulk_create(new_shapes)
                logger.info(f"Created new shapes: {len(new_shapes)}")

            logger.info("Finished updating map and shapes.")
            return instance
        except Exception as e:
            logger.error(f"Error in MapSerializer.update(): {e}")
            raise serializers.ValidationError(f"Failed to update Map: {str(e)}")








class ShapeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shape
        fields = ['image']  # Только поле, которое мы хотим обновить
