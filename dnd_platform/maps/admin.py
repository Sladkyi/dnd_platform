from django.contrib import admin
from django.utils.html import format_html
from .models import Map, Shape, Room, Race, CharacterClass, Spell, MapPoint



class RoomInline(admin.TabularInline):
    model = Room
    extra = 1
class SpellAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'school', 'is_public', 'creator', 'created_at', 'updated_at')
    list_filter = ('level', 'is_public', 'creator')
    search_fields = ('name', 'description', 'school')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

# Админка для рас
@admin.register(Race)
class RaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_public', 'creator', 'created_at')
    list_filter = ('is_public', 'creator')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

# Админка для классов персонажей
@admin.register(CharacterClass)
class CharacterClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_public', 'creator', 'created_at')
    list_filter = ('is_public', 'creator')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
@admin.register(Map)
class MapAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'description', 'image', 'created_at')
    search_fields = ('user__username', 'user__email', 'title')
    ordering = ('id',)
    inlines = [RoomInline]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(MapPoint)
class MapPointAdmin(admin.ModelAdmin):
    list_display = ('title', 'map', 'room', 'x', 'y', 'is_visible', 'created_at', 'updated_at')
    list_filter = ('map', 'room', 'is_visible')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    fields = ('map', 'room', 'x', 'y', 'title', 'description', 'icon_type', 'is_visible', 'created_at', 'updated_at')



@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'map', 'order', 'background_image')
    search_fields = ('name', 'map__title')
    list_filter = ('map',)
    ordering = ('map', 'order')


@admin.register(Shape)
class ShapeAdmin(admin.ModelAdmin):
    class ShapeAdmin(admin.ModelAdmin):
        list_display = ('id', 'name', 'race', 'character_class', 'level', 'is_npc', 'map')
        list_filter = ('is_npc', 'character_class', 'alignment', 'map')
        search_fields = ('name', 'race', 'character_class', 'background', 'appearance', 'notes')

        fieldsets = (
            ('🗺️ Размещение на карте', {
                'fields': ('map', 'type', 'x', 'y', 'rotation', 'fill', 'stroke', 'stroke_width',
                           'num_points', 'inner_radius', 'outer_radius', 'image', 'wiewField', 'isPlayer', 'is_npc')
            }),
            ('🧙 Общая информация', {
                'fields': ('name', 'race', 'character_class', 'level', 'max_hp', 'current_hp', 'speed',
                           'armor_class', 'attack_bonus', 'damage')
            }),
            ('💪 Характеристики', {
                'fields': ('strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma')
            }),
            ('🎭 Ролевая часть', {
                'fields': ('background', 'personality_traits', 'ideals', 'bonds', 'flaws',
                           'appearance', 'allies', 'notes', 'achievements', 'past_experiences')
            }),
            ('🧭 Поведение и особенности', {
                'fields': ('alignment', 'fears', 'motivations', 'reputation')
            }),
            ('🧬 Физические особенности и состояния', {
                'fields': ('notable_features', 'conditions', 'age', 'height', 'weight', 'gender', 'pronouns')
            }),
            ('⚔️ Боевые особенности', {
                'fields': ('fighting_style', 'known_spells', 'equipment', 'resistances', 'vulnerabilities')
            }),
            ('🌀 Повествовательные детали', {
                'fields': ('rumors', 'quotes', 'memories', 'legacy')
            }),
            ('🌍 Взаимодействие с миром', {
                'fields': ('home_town', 'patrons', 'rivalries', 'quests')
            }),
            ('🧠 Психическое и эмоциональное состояние', {
                'fields': ('sanity', 'insanity', 'mood')
            }),
        )

        readonly_fields = ('id', 'created_at')

    def get_map_title(self, obj):
        return obj.map.title
    get_map_title.admin_order_field = 'map'
    get_map_title.short_description = 'Название карты'

    def get_map_title(self, obj):
        return obj.map.title  # Возвращает название карты, к которой относится фигура

    get_map_title.admin_order_field = 'map'  # Позволяет сортировать по этому полю
    get_map_title.short_description = 'Карта'
@admin.register(Spell)
class SpellAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'school', 'is_public', 'creator', 'created_at', 'updated_at')
    list_filter = ('level', 'is_public', 'creator')
    search_fields = ('name', 'description', 'school')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')