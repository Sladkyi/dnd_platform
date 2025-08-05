from django.contrib import admin
from .models import (
    Map, GameSession, Room, MapPoint,
    Item, RoomPlayer, Shape, InventoryItem,
    Spell, Attack, Race, CharacterClass, PlayerInSession
)

@admin.register(Map)
class MapAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at')
    search_fields = ('title', 'user__username')
    list_filter = ('created_at',)

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at', 'max_players')
    search_fields = ('name', 'owner__username')
    list_filter = ('created_at',)

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'map', 'order')
    search_fields = ('name', 'map__title')
    list_filter = ('map',)

@admin.register(MapPoint)
class MapPointAdmin(admin.ModelAdmin):
    list_display = ('title', 'map', 'x', 'y', 'is_visible')
    search_fields = ('title', 'map__title')
    list_filter = ('map', 'is_visible')

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'rarity', 'is_public', 'is_quest_item')
    search_fields = ('name',)
    list_filter = ('rarity', 'is_public', 'is_quest_item')

@admin.register(RoomPlayer)
class RoomPlayerAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'joined_at')
    search_fields = ('user__username', 'room__name')

@admin.register(Shape)
class ShapeAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'map', 'type', 'isPlayer', 'is_npc')
    search_fields = ('name', 'user__username', 'map__title')
    list_filter = ('isPlayer', 'is_npc', 'map')

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('shape', 'item', 'quantity', 'equipped', 'is_quick_slot')
    search_fields = ('shape__name', 'item__name')
    list_filter = ('equipped', 'is_quick_slot')

@admin.register(Spell)
class SpellAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'school', 'creator', 'is_public')
    search_fields = ('name', 'school', 'creator__username')
    list_filter = ('level', 'is_public')

@admin.register(Attack)
class AttackAdmin(admin.ModelAdmin):
    list_display = ('name', 'attack_bonus', 'damage', 'is_ranged')
    search_fields = ('name',)
    list_filter = ('is_ranged',)

@admin.register(Race)
class RaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'size', 'is_public', 'creator')
    search_fields = ('name', 'creator__username')
    list_filter = ('size', 'is_public')

@admin.register(CharacterClass)
class CharacterClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'hit_dice', 'is_public', 'creator')
    search_fields = ('name', 'creator__username')
    list_filter = ('is_public',)

@admin.register(PlayerInSession)
class PlayerInSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'character', 'joined_at')
    search_fields = ('user__username', 'session__name', 'character__name')
    list_filter = ('session',)


# Альтернативно, если хочешь зарегистрировать быстро:
# admin.site.register([Map, GameSession, Room, MapPoint, Item, RoomPlayer, Shape, InventoryItem, Spell, Attack, Race, CharacterClass, PlayerInSession])
