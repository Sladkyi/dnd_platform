from django.db import models
from django.contrib.auth.models import User

from maps.models import Shape
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatar/', blank=True)

    def __str__(self):
        return self.user.username

# Путь к классу
path_to_class = f"{UserProfile.__module__}.{UserProfile.__name__}"
print("path " + path_to_class)
