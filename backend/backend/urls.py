"""
URL-Konfiguration für das Backend-Projekt.

Diese Datei definiert die Haupt-URL-Routen des Projekts,
einschließlich API-Endpunkten und Authentifizierungspfaden.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from users.views.auth_views import CustomTokenObtainPairView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API-Endpunkte für Module
    path('api/modules/', include('modules.urls')),
    
    # API-Endpunkte für Prüfungen (final_exam)
    path('api/exams/', include('final_exam.urls')),

    # API-Endpunkte für Benutzer
    path('api/users/', include('users.urls')),

    # JWT-Authentifizierungsendpunkte
    path(
        'api/token/', 
        CustomTokenObtainPairView.as_view(), 
        name='token_obtain_pair'
    ),  # Liefert Access- und Refresh-Token (POST mit username/password)
       # Enthält is_staff und is_superuser im Token-Payload
    
    path(
        'api/token/refresh/', 
        TokenRefreshView.as_view(), 
        name='token_refresh'
    ),  # Erneuert Access-Token mit Refresh-Token (POST mit refresh)
    
    path(
        'api/token/verify/', 
        TokenVerifyView.as_view(), 
        name='token_verify'
    ),  # Prüft, ob Access-Token gültig ist (POST mit token)
]

# Konfiguration für static/media files im Development (falls noch nicht vorhanden)
# from django.conf import settings
# from django.conf.urls.static import static
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
