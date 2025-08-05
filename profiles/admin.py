from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'bio', 'avatar')  # Используем поле user, которое связано с моделью User
    search_fields = ('user__username', 'user__email')  # Поиск по полям модели User
    ordering = ('id',)

    def user(self, obj):
        return obj.user.username  # Возвращаем имя пользователя

    user.admin_order_field = 'user'  # Позволяет сортировать по этому полю