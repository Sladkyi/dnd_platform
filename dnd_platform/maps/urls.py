from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MapViewSet,
    CreateURLView,
    MapDetailAPIView,
    MapUploadImage,
    PointOfInterestEditing,
    ShapeDetailAPIView,
    CreateNewRoomView,
    RoomView,
    SingleRoomView,
    EntityEditing,
    JoinRoomView,
    RoomDetailView,
    JoinGameView,  # Представление для присоединения по ссылке
)
router = DefaultRouter()
router.register(r'maps' , MapViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('maps/change/<int:pk>/', MapDetailAPIView.as_view(), name='map-detail'),
    path('maps/createURL/<int:pk>/', CreateURLView.as_view(), name='create-url'),
    path('maps/uploadImage/<int:pk>/', MapUploadImage.as_view(), name='map-upload-image'),
    path('maps/PontOfInterest/<int:pk>/', PointOfInterestEditing.as_view(), name='map-upload-image'),
    path('maps/changePosition/<int:pk>/', ShapeDetailAPIView.as_view(), name='map-change-position'),
    path('maps/changePosition/delete/<int:pk>/', ShapeDetailAPIView.as_view(), name='shape-delete'),
    path('maps/CreateNewRoom/<int:pk>/', CreateNewRoomView.as_view(), name='upload-map'),
    path('maps/GetRooms/<int:pk>/', RoomView.as_view(), name='get-room-list'),
    path('maps/rooms/<int:pk>/', SingleRoomView.as_view(), name='single-room'),
    path('maps/entityEditing/<int:pk>/', EntityEditing.as_view(), name='entity-edidting'),
    path('maps/room/<int:room_id>/join/', JoinRoomView.as_view(), name='join-room'),
    path('maps/room/<int:room_id>/', RoomDetailView.as_view(), name='room-detail'),

    # Присоединение по сгенерированной ссылке
    path('join/<uuid:session_id>/', JoinGameView.as_view(), name='join_game'),
]


