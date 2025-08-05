from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView


router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet)


urlpatterns = [
    path('profile/login/', LoginProfile.as_view() , name = 'login_api'),
    path('profile/me/', UserProfileDetail.as_view(), name='user-profile-detail'),
    path('profile/', CheckConn.as_view(), name='user-profile-connection'),
    path('profile/map/<str:map_id>/', UserMap.as_view(), name='user_map'),
    path('profile/getEntities/<int:pk>/', UserEntities.as_view(), name='user-entities'),
    path('', include(router.urls)),
    ]