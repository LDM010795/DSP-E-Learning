from django.urls import path, include
from .views.auth_views import LogoutView, CustomTokenObtainPairView
from .views.user_crud_view import UserCrudViewSet, SetInitialPasswordView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

app_name = 'users'

# ViewSet Router einrichten
router = DefaultRouter()
router.register(r'admin/users', UserCrudViewSet, basename='admin-users')

urlpatterns = [
    # Token Authentifizierung (muss evtl. in Haupt-urls.py sein, hier zur Klarheit)
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Benutzerauthentifizierung
    path('logout/', LogoutView.as_view(), name='logout'),

    # Initiales Passwort setzen (nach Login, wenn erforderlich)
    path('set-initial-password/', SetInitialPasswordView.as_view(), name='set_initial_password'),

    # ViewSet-Router URLs einbinden
    path('', include(router.urls)),
    
    # Hier könnten Endpunkte für Benutzerprofilmanagement hinzugefügt werden
    # path('profile/', UserProfileView.as_view(), name='profile'),
]