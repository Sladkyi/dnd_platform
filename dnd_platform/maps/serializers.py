from rest_framework import serializers
from .models import Map, Shape , Room , MapPoint, Spell, CharacterClass, Race, Item
import logging
import json
logger = logging.getLogger(__name__)
from .models import Attack

class AttackSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(read_only=True)  # Явное поле creator

    class Meta:
        model = Attack
        fields = '__all__'
        read_only_fields = ['creator']

class SpellSerializer(serializers.ModelSerializer):
    classes = serializers.SerializerMethodField()

    class Meta:
        model = Spell
        fields = '__all__'
        read_only_fields = ['creator']  
    def get_classes(self, obj):
        try:
            return json.loads(obj.classes_json or '[]')
        except:
            return []

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)
        classes = data.get('classes', [])
        internal['classes_json'] = json.dumps(classes)
        return internal


class ShapeSerializer(serializers.ModelSerializer):
    x = serializers.FloatField(required=False)
    y = serializers.FloatField(required=False)
    type = serializers.CharField(required=False)
    map = serializers.PrimaryKeyRelatedField(queryset=Map.objects.all())
    # ✅ Сохраняем по ID, но читаем подробно
    attacks = serializers.PrimaryKeyRelatedField(queryset=Attack.objects.all(), many=True, required=False)
    spells = serializers.PrimaryKeyRelatedField(queryset=Spell.objects.all(), many=True, required=False)
    temp_hp = serializers.IntegerField(required=False)
    # Раса
    race_name = serializers.CharField(source='race.name', read_only=True)
    race_traits = serializers.SerializerMethodField()
    race_languages = serializers.SerializerMethodField()
    race_ability_bonuses = serializers.SerializerMethodField()
    race_size = serializers.CharField(source='race.size', read_only=True)
    race_speed = serializers.IntegerField(source='race.speed', read_only=True)

    # Класс
    character_class_name = serializers.CharField(source='character_class.name', read_only=True)
    class_primary_abilities = serializers.SerializerMethodField()
    class_hit_dice = serializers.CharField(source='character_class.hit_dice', read_only=True)
    class_proficiencies = serializers.CharField(source='character_class.proficiencies', read_only=True)
    class_features = serializers.SerializerMethodField()

    class Meta:
        model = Shape
        fields = '__all__'  # ✅ Поля карты теперь включены
        read_only_fields = ['user', 'owner']  # 🔥 Вот это добавь
    def get_race_traits(self, obj):
        return obj.race.traits if obj.race and isinstance(obj.race.traits, list) else []

    def get_race_languages(self, obj):
        return obj.race.languages if obj.race and isinstance(obj.race.languages, list) else []

    def get_race_ability_bonuses(self, obj):
        return obj.race.ability_bonuses if obj.race and isinstance(obj.race.ability_bonuses, dict) else {}

    def get_class_primary_abilities(self, obj):
        return obj.character_class.primary_abilities if obj.character_class and isinstance(obj.character_class.primary_abilities, list) else []

    def get_class_features(self, obj):
        if obj.character_class:
            features = []
            for lvl in range(1, obj.level + 1):
                lvl_str = str(lvl)
                if lvl_str in obj.character_class.class_features_by_level:
                    features.extend(obj.character_class.class_features_by_level[lvl_str])
            return features or obj.character_class.starting_features
        return []
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['attacks'] = AttackSerializer(instance.attacks.all(), many=True).data
        rep['spells'] = SpellSerializer(instance.spells.all(), many=True).data
        return rep

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
        read_only_fields = ["user"]

    def create(self, validated_data):
        try:
            logger.info("Starting MapSerializer.create()")
            shapes_data = validated_data.pop('shapes', [])
            map_instance = Map.objects.create(**validated_data)
            logger.info(f"Map created with ID: {map_instance.id}")

            if shapes_data:
                Shape.objects.bulk_create([
                    Shape(map=map_instance, current_map=map_instance, **shape_data)
                    for shape_data in shapes_data
                ])
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
                        if getattr(shape_instance, attr) != value:
                            setattr(shape_instance, attr, value)
                            updated = True
                    if updated:
                        updated_shape_ids.append(shape_id)
                else:
                    new_shapes.append(Shape(map=instance, current_map=instance, **shape_data))

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

class CharacterClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = CharacterClass
        fields = '__all__'
        read_only_fields = ['creator']

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)
        # Обработка JSON-поля primary_abilities
        internal['primary_abilities'] = data.get('primary_abilities', [])
        return internal

class RaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Race
        fields = '__all__'
        read_only_fields = ['creator']

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)
        # Обработка JSON-поля ability_bonuses
        internal['ability_bonuses'] = data.get('ability_bonuses', {})
        return internal


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ['creator']


