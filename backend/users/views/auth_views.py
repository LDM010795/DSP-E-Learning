"""
Authentifizierungsbezogene Views für die Benutzeranwendung.
Enthält benutzerdefinierte JWT-Token-Implementierungen und Logout-Funktionalität.
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from ..models import Profile

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Erweitert den Standard-TokenObtainPairSerializer, um zusätzliche Benutzerinformationen
    in den JWT-Token einzufügen.
    
    Fügt dem Token folgende Felder hinzu:
    - is_staff: Gibt an, ob der Benutzer Mitarbeiterrechte hat
    - is_superuser: Gibt an, ob der Benutzer Administratorrechte hat
    - username: Der Benutzername als zusätzliche Information
    """
    @classmethod
    def get_token(cls, user):
        # Ruft die übergeordnete Methode auf, um das Basis-Token zu erhalten
        token = super().get_token(user)

        # Füge benutzerdefinierte Felder hinzu
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        token['username'] = user.username

        return token

    def validate(self, attrs):
        """ Überschreiben, um das force_password_change Flag hinzuzufügen """
        data = super().validate(attrs)
        # Füge das Flag zur Response hinzu, wenn der Benutzer authentifiziert ist
        try:
            profile = self.user.profile
            data['require_password_change'] = profile.force_password_change
        except Profile.DoesNotExist:
            # Fallback, falls Profil nicht existiert (sollte nicht passieren)
            data['require_password_change'] = False
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Benutzerdefinierte TokenObtainPairView mit erweitertem Serializer.
    
    Diese View wird über /api/token/ aufgerufen und ersetzt die Standard-JWT-View.
    Sie verwendet den CustomTokenObtainPairSerializer, um zusätzliche Benutzerinformationen
    im Token bereitzustellen, die im Frontend für Berechtigungsprüfungen verwendet werden können.
    """
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    """
    View zum Ausloggen eines Benutzers durch Blacklisting seines Refresh-Tokens.
    
    Diese View erfordert Authentifizierung und nimmt das Refresh-Token im Request-Body entgegen.
    Nach erfolgreicher Verarbeitung wird das Token auf die Blacklist gesetzt, sodass es nicht mehr
    für die Generierung neuer Access-Tokens verwendet werden kann.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """
        Verarbeitet POST-Anfragen zum Ausloggen eines Benutzers.
        
        Request-Body muss das 'refresh'-Token enthalten.
        
        Returns:
            Response: 205 bei Erfolg, 400 bei ungültigem Token, 500 bei unerwarteten Fehlern
        """
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        
        except TokenError as e:
            # Token-spezifische Fehlerbehandlung (z.B. ungültiges oder bereits gesperrtes Token)
            return Response(
                {"error": f"Token error: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            # Allgemeine Fehlerbehandlung
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 