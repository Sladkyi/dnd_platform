from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MapViewSet,
    MapDetailAPIView,
    CreateURLView,
    MapUploadImage,
    # PointOfInterestEditing,
    ShapeDetailAPIView,
    CreateNewRoomView,
    RoomView,
    SingleRoomView,
    EntityEditing,
    JoinSessionWithShapeView,
    SpellByCreatorView,
    SpellCreateView,
    SpellUpdateView,
    SpellDeleteView,
    JoinGameView,

    # 👇 Импорты для классов, рас и предметов
    ClassByCreatorView,
    ClassCreateView,
    ClassUpdateView,
    ClassDeleteView,

    RaceByCreatorView,
    RaceCreateView,
    RaceUpdateView,
    RaceDeleteView,
    ItemUpdateView,
    ItemByCreatorView,
    ItemCreateView,
    ItemUpdateView,
    ItemDeleteView,
    AttackByOwnerView,
    AttackCreateView,
    AttackUpdateView,
    AttackDeleteView,
    ShapeCreateView,
    SessionPlayersView,
    ShapeListView,
    ShapeDetailView,
    ItemByMapView,
    ItemInstanceViewSet,
    ItemInstanceByMapView, 
    ItemInstanceByRoomView, 
    PointOfInterestViewSet, 
    ShapeCloneView
)
router = DefaultRouter()
router.register(r'maps' , MapViewSet)
router.register(r'item-instances', ItemInstanceViewSet)  
router.register(r'poi', PointOfInterestViewSet, basename='poi')

urlpatterns = [
    path('', include(router.urls)),
    path('shapes/<int:pk>/', ShapeDetailView.as_view(), name='shape-detail'),
    path('shapes/clone/', ShapeCloneView.as_view(), name='shape-clone'),
    path('maps/<int:map_id>/shapes/', ShapeListView.as_view(), name='shape-list'),
    path('maps/change/<int:pk>/', MapDetailAPIView.as_view(), name='map-detail'),
    path('maps/createURL/<int:pk>/', CreateURLView.as_view(), name='create-url'),
    path('maps/uploadImage/<int:pk>/', MapUploadImage.as_view(), name='map-upload-image'),
    # path('maps/PontOfInterest/<int:pk>/', PointOfInterestEditing.as_view(), name='map-upload-image'),
    path('maps/changePosition/<int:pk>/', ShapeDetailAPIView.as_view(), name='map-change-position'),
    path('maps/changePosition/delete/<int:pk>/', ShapeDetailAPIView.as_view(), name='shape-delete'),
    path('maps/shape/update/<int:pk>/', ShapeDetailAPIView.as_view(), name='shape-update'),
    path('maps/CreateNewRoom/<int:pk>/', CreateNewRoomView.as_view(), name='create-room'),
    path('maps/GetRooms/<int:pk>/', RoomView.as_view(), name='get-room-list'),
    path('maps/rooms/<int:pk>/', SingleRoomView.as_view(), name='single-room'),
    path('maps/entityEditing/<int:pk>/', EntityEditing.as_view(), name='entity-edidting'),
    path('sessions/joinSessionWithShape/<uuid:session_id>/', JoinSessionWithShapeView.as_view(), name='join-session'),
    path('spells/getByCreator/<int:creator_id>/', SpellByCreatorView.as_view(), name='get-spells-by-creator'),
    path('spells/create/', SpellCreateView.as_view(), name='spell-create'),
    path('spells/update/<int:pk>/', SpellUpdateView.as_view(), name='spell-update'),
    path('spells/<int:pk>/delete/', SpellDeleteView.as_view(), name='spell-delete'),
    path('items/by-map/<int:map_id>/', ItemByMapView.as_view(), name='items-by-map'),
    path('maps/rooms/<int:pk>/delete/', SingleRoomView.as_view(), name='delete-room'),
    # Присоединение по сгенерированной ссылке
    path('maps/join/<uuid:session_id>/', JoinGameView.as_view(), name='join_game'),
# Классы
    path('classes/getByCreator/<int:creator_id>/', ClassByCreatorView.as_view(), name='get-classes-by-creator'),
    path('classes/create/', ClassCreateView.as_view(), name='class-create'),
    path('classes/update/<int:pk>/', ClassUpdateView.as_view(), name='class-update'),
    path('classes/<int:pk>/delete/', ClassDeleteView.as_view(), name='class-delete'),

    # Расы
    path('races/getByCreator/<int:creator_id>/', RaceByCreatorView.as_view(), name='get-races-by-creator'),
    path('races/create/', RaceCreateView.as_view(), name='race-create'),
    path('races/update/<int:pk>/', RaceUpdateView.as_view(), name='race-update'),
    path('races/<int:pk>/delete/', RaceDeleteView.as_view(), name='race-delete'),

    # Предметы
    path('items/getByCreator/<int:creator_id>/', ItemByCreatorView.as_view(), name='get-items-by-creator'),
    path('items/create/', ItemCreateView.as_view(), name='item-create'),
    path('items/update/<int:pk>/', ItemUpdateView.as_view(), name='item-update'),
    path('items/<int:pk>/delete/', ItemDeleteView.as_view(), name='item-delete'),
    path('items/update/<int:pk>/', ItemUpdateView.as_view(), name='update-item'),
    path('item-instances/by-map/<int:map_id>/', ItemInstanceByMapView.as_view(), name='item-instances-by-map'),
    path('item-instances/by-map/<int:map_id>/room/<int:room_id>/', ItemInstanceByRoomView.as_view(), name='item-instances-by-room'),



    path('attacks/getByOwner/<int:creator_id>/', AttackByOwnerView.as_view(), name='get-attacks-by-owner'),
    path('attacks/create/', AttackCreateView.as_view(), name='attack-create'),
    path('attacks/update/<int:pk>/', AttackUpdateView.as_view(), name='attack-update'),
    path('attacks/<int:pk>/delete/', AttackDeleteView.as_view(), name='attack-delete'),

    path('sessions/<uuid:session_id>/players/', SessionPlayersView.as_view(), name='session-players'),
    path('shapes/create/', ShapeCreateView.as_view(), name='shape-create'),
    ]


