from django.db import models
from django.contrib.auth.models import User
import uuid
from django.contrib.postgres.fields import JSONField  # Используйте JSONField для хранения данных о фигурах


class Map(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    title = models.CharField(max_length=100, verbose_name="Название")
    full_card_map_image = models.ImageField(upload_to='maps/', null=True, blank=True)
    description = models.TextField(blank=True, verbose_name="Описание")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    image = models.ImageField(upload_to='maps/', null=True, blank=True)
    last_opened_room_id = models.PositiveIntegerField(null=True, blank=True,
                                                      verbose_name="ID последней открытой комнаты")
    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Карта"
        verbose_name_plural = "Карты"
class GameSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    password = models.CharField(max_length=100, blank=True, null=True)
    max_players = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    map = models.ForeignKey(Map, on_delete=models.CASCADE, related_name="open_rooms", verbose_name="Карта")
    code = models.CharField(max_length=100, blank=True, null=True)



class Room(models.Model):
    map = models.ForeignKey(Map, on_delete=models.CASCADE, related_name="rooms", verbose_name="Карта")
    name = models.CharField(max_length=100, verbose_name="Название комнаты")
    background_image = models.ImageField(upload_to='rooms/backgrounds/', null=True, blank=True, verbose_name="Фоновое изображение")
    description = models.TextField(blank=True, verbose_name="Описание комнаты")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")  # если тебе нужно упорядочивание

    def __str__(self):
        return f"{self.name} (для карты: {self.map.title})"

    class Meta:
        verbose_name = "Комната"
        verbose_name_plural = "Комнаты"
        ordering = ['order']  # по умолчанию сортировать по порядку

class MapPoint(models.Model):
    map = models.ForeignKey(Map, on_delete=models.CASCADE, related_name="points", verbose_name="Карта")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Комната (если связана)")
    x = models.FloatField(verbose_name="Координата X")
    y = models.FloatField(verbose_name="Координата Y")
    title = models.CharField(max_length=100, verbose_name="Название точки")
    description = models.TextField(blank=True, verbose_name="Описание")
    icon_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="Тип иконки (например, 'NPC', 'враг', 'переход')")
    is_visible = models.BooleanField(default=True, verbose_name="Видимость на карте")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.map.title})"

    class Meta:
        verbose_name = "Точка на карте"
        verbose_name_plural = "Точки на карте"

class Item(models.Model):
    # 📦 Базовая информация
    name = models.CharField(max_length=100, verbose_name="Название")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    icon = models.ImageField(upload_to='items/icons/', null=True, blank=True, verbose_name="Иконка")

    # ✨ Редкость
    RARITY_CHOICES = [
        ('common', 'Обычный'),
        ('uncommon', 'Необычный'),
        ('rare', 'Редкий'),
        ('epic', 'Эпический'),
        ('legendary', 'Легендарный'),
        ('artifact', 'Артефакт'),
    ]
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common', verbose_name="Редкость")

    # ⚔️ Боевая механика
    damage = models.CharField(max_length=50, blank=True, null=True, verbose_name="Урон")  # Например: "1d8 + 2"
    armor_bonus = models.IntegerField(default=0, verbose_name="Бонус к броне")
    effect = models.TextField(blank=True, null=True, verbose_name="Эффект")  # Например: "Восстанавливает 5 HP"
    is_magical = models.BooleanField(default=False, verbose_name="Магический")

    # 🎭 Использование
    is_consumable = models.BooleanField(default=False, verbose_name="Расходуемый")
    charges = models.IntegerField(default=0, verbose_name="Заряды")
    max_charges = models.IntegerField(default=0, verbose_name="Максимум зарядов")
    slot_type = models.CharField(
        max_length=50,
        choices=[
            ('head', 'Голова'),
            ('body', 'Тело'),
            ('weapon', 'Оружие'),
            ('accessory', 'Аксессуар'),
        ],
        blank=True,
        null=True,
        verbose_name="Слот экипировки"
    )

    # 🧠 Требования и доступность
    requirements = models.TextField(blank=True, null=True, verbose_name="Требования")
    usable_by = models.JSONField(default=list, blank=True, verbose_name="Кем используется")  # ["Wizard", "Cleric"]

    # 🧬 Нарратив и особенности
    flavor_text = models.CharField(max_length=200, blank=True, null=True, verbose_name="Флэйвор-текст")
    lore = models.TextField(blank=True, null=True, verbose_name="Лор")
    is_unique = models.BooleanField(default=False, verbose_name="Уникальный")

    # 🛡 Вес и стоимость
    weight = models.FloatField(default=0.0, verbose_name="Вес")
    value = models.IntegerField(default=0, verbose_name="Ценность (золото)")

    # 🌐 Публичность и статус
    is_public = models.BooleanField(default=False, verbose_name="Публичный предмет")
    is_quest_item = models.BooleanField(default=False, verbose_name="Квестовый предмет")

    # 🕓 Служебное
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создан")

    def __str__(self):
        return self.name or f"Item #{self.id}"

    class Meta:
        verbose_name = "Предмет"
        verbose_name_plural = "Предметы"


    def __str__(self):
        return self.name


class RoomPlayer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

class Shape(models.Model):
    SHAPE_TYPES = [
        ('star', 'Star'),
        ('circle', 'Circle'),
        ('rectangle', 'Rectangle'),
    ]
    is_clone = models.BooleanField(default=False)
    # 📌 Базовые свойства на карте
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    owner = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="controlled_shapes",
        verbose_name="Игрок, управляющий сущностью"
    )
    map = models.ForeignKey('Map', on_delete=models.CASCADE, related_name="shapes", null=True, blank=True)
    type = models.CharField(max_length=50, choices=SHAPE_TYPES)
    x = models.FloatField()
    y = models.FloatField()
    rotation = models.FloatField(default=0)
    fill = models.CharField(max_length=20, default="#FFFFFF")
    stroke = models.CharField(max_length=20, blank=True, null=True)
    stroke_width = models.FloatField(default=1.0)
    num_points = models.IntegerField(blank=True, null=True)
    inner_radius = models.FloatField(blank=True, null=True)
    outer_radius = models.FloatField(blank=True, null=True)
    image = models.ImageField(upload_to='shapes/', null=True, blank=True)
    wiewField = models.IntegerField(blank=True, null=True, default=60)
    isPlayer = models.BooleanField(default=False)
    is_npc = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    subclass = models.CharField(max_length=100, blank=True, null=True)
    charStory = models.CharField(max_length=100, blank=True, null=True)

    # 🧙 Общая информация
    name = models.CharField(max_length=100, blank=True, null=True)
    race = models.CharField(max_length=100, blank=True, null=True)
    character_class = models.CharField(max_length=100, blank=True, null=True)
    level = models.IntegerField(default=1)
    max_hp = models.IntegerField(default=10)
    current_hp = models.IntegerField(default=10)
    speed = models.IntegerField(default=30)
    armor_class = models.IntegerField(default=10)
    attack_bonus = models.IntegerField(default=0)
    damage = models.CharField(max_length=20, blank=True, null=True)

    # 🧠 Характеристики
    strength = models.IntegerField(default=10)
    dexterity = models.IntegerField(default=10)
    constitution = models.IntegerField(default=10)
    intelligence = models.IntegerField(default=10)
    wisdom = models.IntegerField(default=10)
    charisma = models.IntegerField(default=10)

    # 🔮 Ролевая часть
    background = models.TextField(blank=True, null=True)
    personality_traits = models.TextField(blank=True, null=True)
    ideals = models.TextField(blank=True, null=True)
    bonds = models.TextField(blank=True, null=True)
    flaws = models.TextField(blank=True, null=True)
    appearance = models.TextField(blank=True, null=True)
    allies = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    achievements = models.TextField(blank=True, null=True)
    past_experiences = models.TextField(blank=True, null=True)

    # 🧭 Поведение и особенности
    alignment = models.CharField(max_length=50, blank=True, null=True)
    fears = models.TextField(blank=True, null=True)
    motivations = models.TextField(blank=True, null=True)
    reputation = models.TextField(blank=True, null=True)

    # 🧬 Физические особенности и состояния
    notable_features = models.TextField(blank=True, null=True)
    conditions = models.TextField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    height = models.CharField(max_length=20, blank=True, null=True)
    weight = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    pronouns = models.CharField(max_length=50, blank=True, null=True)

    # ⚔️ Боевые особенности
    fighting_style = models.CharField(max_length=100, blank=True, null=True)
    known_spells = models.TextField(blank=True, null=True)
    equipment = models.TextField(blank=True, null=True)
    resistances = models.TextField(blank=True, null=True)
    vulnerabilities = models.TextField(blank=True, null=True)

    # 🌀 Повествовательные детали
    rumors = models.TextField(blank=True, null=True)
    quotes = models.TextField(blank=True, null=True)
    memories = models.TextField(blank=True, null=True)
    legacy = models.TextField(blank=True, null=True)

    # 🌍 Взаимодействие с миром
    home_town = models.CharField(max_length=100, blank=True, null=True)
    patrons = models.TextField(blank=True, null=True)
    rivalries = models.TextField(blank=True, null=True)
    quests = models.TextField(blank=True, null=True)

    # 🌀 Психическое и эмоциональное состояние
    sanity = models.IntegerField(default=100)
    insanity = models.TextField(blank=True, null=True)
    mood = models.CharField(max_length=50, blank=True, null=True)
    # 🎯 Механика боя и прогрессии
    initiative = models.IntegerField(default=0)
    proficiency_bonus = models.IntegerField(default=2)
    hit_dice = models.CharField(max_length=20, blank=True, null=True)
    death_saves_success = models.IntegerField(default=0)
    death_saves_fail = models.IntegerField(default=0)

    # 🪄 Магия
    spell_slots_total = models.IntegerField(default=0)
    spell_slots_used = models.IntegerField(default=0)
    known_cantrips = models.TextField(blank=True, null=True)
    prepared_spells = models.TextField(blank=True, null=True)

    # 🛡 Спасброски и навыки
    saving_throws = models.JSONField(default=dict)
    skills = models.JSONField(default=dict)

    # ⚡ Очки действия
    max_ap = models.IntegerField(default=3)
    current_ap = models.IntegerField(default=3)

    # 🗿 Статусы
    statuses = models.JSONField(default=list)
    is_invisible = models.BooleanField(default=False)
    is_stunned = models.BooleanField(default=False)
    is_paralyzed = models.BooleanField(default=False)
    reaction_used = models.BooleanField(default=False)
    extra_attacks = models.IntegerField(default=0)

    head_slot = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_on_head')
    body_slot = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_on_body')
    weapon_slot = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipped_as_weapon')

    created_from_test = models.BooleanField(default=False)
    emotion_override = models.CharField(max_length=50, blank=True, null=True)
    favorite_gifs = models.JSONField(default=list)    
    inventory = models.ManyToManyField('Item', through='InventoryItem', related_name='owners')
# ActionLog: shape, action, timestamp, description
    tags = models.JSONField(default=list, blank=True)
    experience = models.IntegerField(default=0)
    is_dead = models.BooleanField(default=False)
    is_permanently_dead = models.BooleanField(default=False, verbose_name="Персонаж окончательно мёртв")
    permadeath = models.BooleanField(default=False, verbose_name="Перманентная смерть")
    is_public = models.BooleanField(default=False, verbose_name="Публичный персонаж")


    def __str__(self):
        return self.name or f"Shape #{self.id}"

    class Meta:
        verbose_name = "Сущность / Персонаж"
        verbose_name_plural = "Сущности / Персонажи"

from django.db import models



class InventoryItem(models.Model):
    shape = models.ForeignKey(Shape, on_delete=models.CASCADE, related_name='inventory_items')

    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    equipped = models.BooleanField(default=False)  # если это меч или броня
    is_quick_slot = models.BooleanField(default=False)  # используется в "быстром инвентаре"

    def __str__(self):
        return f"{self.item.name} x{self.quantity} ({self.shape})"


class Spell(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название заклинания")
    description = models.TextField(verbose_name="Описание")
    level = models.IntegerField(default=0, verbose_name="Уровень заклинания")  # 0 — кантрип
    school = models.CharField(max_length=100, verbose_name="Школа магии", blank=True, null=True)

    casting_time = models.CharField(max_length=100, verbose_name="Время накладывания", default="1 действие")
    range = models.CharField(max_length=100, verbose_name="Дистанция", default="На себя")
    duration = models.CharField(max_length=100, verbose_name="Длительность", default="Мгновенно")
    components = models.CharField(max_length=100, verbose_name="Компоненты", default="В")  # В, С, М
    materials = models.TextField(blank=True, null=True, verbose_name="Материалы (если есть)")

    damage = models.CharField(max_length=50, blank=True, null=True, verbose_name="Урон (например, 3d6)")
    effect = models.TextField(blank=True, null=True, verbose_name="Эффект/Механика")
    is_concentration = models.BooleanField(default=False, verbose_name="Концентрация")
    is_ritual = models.BooleanField(default=False, verbose_name="Ритуал")

    gif = models.FileField(upload_to='spells/gifs/', blank=True, null=True, verbose_name="Гифка к заклинанию")

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="spells", verbose_name="Создатель заклинания")
    is_public = models.BooleanField(default=False, verbose_name="Публичное заклинание")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Заклинание"
        verbose_name_plural = "Заклинания"

    def __str__(self):
        return self.name

class Race(models.Model):
    is_public = models.BooleanField(default=False, verbose_name="Публичная раса")
    name = models.CharField(max_length=100, verbose_name="Название расы")
    description = models.TextField(verbose_name="Описание расы")
    traits = models.TextField(blank=True, null=True, verbose_name="Черты расы")
    speed = models.IntegerField(default=30, verbose_name="Скорость перемещения")
    size = models.CharField(max_length=20, choices=[
        ('tiny', 'Крошечный'),
        ('small', 'Маленький'),
        ('medium', 'Средний'),
        ('large', 'Большой'),
        ('huge', 'Огромный'),
    ], default='medium', verbose_name="Размер")

    languages = models.TextField(blank=True, null=True, verbose_name="Языки")
    ability_bonuses = models.JSONField(default=dict, verbose_name="Бонусы к характеристикам (например, {'STR': 2, 'DEX': 1})")
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Создатель")
    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        verbose_name = "Раса"
        verbose_name_plural = "Расы"

    def __str__(self):
        return self.name

class CharacterClass(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название класса")
    is_public = models.BooleanField(default=False, verbose_name="Публичная раса")
    description = models.TextField(verbose_name="Описание класса")
    hit_dice = models.CharField(max_length=10, verbose_name="Кость хитов", default="1d8")
    primary_abilities = models.JSONField(default=list, verbose_name="Основные характеристики (например, ['STR', 'CHA'])")
    proficiencies = models.TextField(blank=True, null=True, verbose_name="Навыки и владения")
    spellcasting_ability = models.CharField(max_length=10, blank=True, null=True, verbose_name="Характеристика заклинаний")

    features = models.TextField(blank=True, null=True, verbose_name="Особенности")
    spell_list = models.ManyToManyField(Spell, blank=True, verbose_name="Доступные заклинания")

    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Создатель")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Класс персонажа"
        verbose_name_plural = "Классы персонажей"

    def __str__(self):
        return self.name


class PlayerInSession(models.Model):
    session = models.ForeignKey(
        GameSession,
        on_delete=models.CASCADE,
        related_name='players'  # 👈 чтобы потом удобно session.players.all()
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Пользователь"
    )
    character = models.ForeignKey(
        Shape,
        on_delete=models.CASCADE,
        verbose_name="Персонаж"
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'user')  # Один пользователь — одна запись в сессии
        verbose_name = "Игрок в сессии"
        verbose_name_plural = "Игроки в сессиях"

    def __str__(self):
        return f"{self.user.username} в сессии {self.session.id}"