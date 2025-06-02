from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.shortcuts import get_object_or_404
from ..serializers import UserSerializer, InitialPasswordSetSerializer
from ..models import Profile

User = get_user_model()

class IsAdminOrStaff(permissions.BasePermission):
    """
    Erlaubt Zugriff nur für Admins und Staff-Benutzer.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)

class UserCrudViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf dem User-Modell.
    Erstellt jetzt aktive Benutzer mit initialem Passwort.
    """
    queryset = User.objects.all().order_by('-date_joined').prefetch_related('profile')
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrStaff]
    
    def perform_create(self, serializer):
        """Lässt den Serializer das Hashen über create_user übernehmen."""
        print(f"[CREATE USER] Empfangene Daten (vor Validierung): {self.request.data}")
        print(f"[CREATE USER] Validierte Daten (Serializer): {serializer.validated_data}")

        # Kein manuelles Hashen hier!
        # password = serializer.validated_data.get('password')
        # if password:
        #     hashed_password = make_password(password)
        #     serializer.validated_data['password'] = hashed_password
        #     print(f"[CREATE USER] Passwort '{password[:3]}...' gehasht zu '{hashed_password[:10]}...' ")
        # else:
        #     print("[CREATE USER] Kein Passwort zum Hashen übergeben.")

        # Benutzer wird aktiv erstellt, Profil mit force_password_change=True wird durch Signal erstellt
        # serializer.save() ruft UserSerializer.create auf, der create_user nutzt
        user = serializer.save()
        print(f"[CREATE USER] Benutzer '{user.username}' (ID: {user.id}) erfolgreich erstellt und gespeichert.")
        try:
            print(f"[CREATE USER] Profil für '{user.username}': force_password_change={user.profile.force_password_change}")
        except Profile.DoesNotExist:
            print(f"[CREATE USER] Profil für '{user.username}' konnte nicht sofort gefunden werden (sollte durch Signal erstellt werden).")
    
    def perform_update(self, serializer):
        """Override um Passwörter bei Updates korrekt zu hashen"""
        instance = serializer.instance
        print(f"[UPDATE USER] Aktualisiere Benutzer '{instance.username}' (ID: {instance.id})")
        print(f"[UPDATE USER] Empfangene Daten (vor Validierung): {self.request.data}")
        print(f"[UPDATE USER] Validierte Daten (Serializer): {serializer.validated_data}")
        updated_instance = serializer.save()
        print(f"[UPDATE USER] Benutzer '{updated_instance.username}' erfolgreich aktualisiert und gespeichert.")
    
    def send_activation_email(self, user):
        """Generiert Token und sendet die Aktivierungs-E-Mail.
        Stellt sicher, dass die FRONTEND_URL in settings.py konfiguriert ist.
        """
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        activation_link = f"{frontend_url}/set-password/{uid}/{token}/"

        subject = 'Aktivieren Sie Ihr Konto für E-Learning DSP'
        message = render_to_string('emails/activate_account.txt', {
            'user': user,
            'activation_link': activation_link,
        })
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            print(f"Activation email sent to {user.email} with link: {activation_link}") # Für console backend
        except Exception as e:
            print(f"Error sending activation email to {user.email}: {e}")
            # Hier könnte man Logging hinzufügen oder den Fehler anders behandeln
    
    @action(detail=False, methods=['get'])
    def staff_users(self, request):
        """Endpunkt um nur Staff-Benutzer zurückzugeben"""
        staff_users = self.queryset.filter(is_staff=True)
        serializer = self.get_serializer(staff_users, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def admin_users(self, request):
        """Endpunkt um nur Admin-Benutzer zurückzugeben"""
        admin_users = self.queryset.filter(is_superuser=True)
        serializer = self.get_serializer(admin_users, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def simplified_list(self, request):
        """
        Gibt eine vereinfachte Liste aller Benutzer zurück.
        Enthält nur Benutzername, E-Mail und Namen als Kürzel.
        """
        users = self.queryset.all()
        user_data = []
        
        for user in users:
            # Erstelle Namenskürzel aus Vor- und Nachname
            first_initial = user.first_name[0:1] if user.first_name else ""
            last_initial = user.last_name[0:2] if user.last_name else ""
            name_abbreviation = f"{first_initial}.{last_initial}".lower() if first_initial and last_initial else ""
            
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name_abbreviation': name_abbreviation
            })
        
        return Response(user_data)
    
    @action(detail=True, methods=['post'])
    def set_staff_status(self, request, pk=None):
        """Setze Staff-Status für einen Benutzer"""
        user = self.get_object()
        user.is_staff = request.data.get('is_staff', False)
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_active_status(self, request, pk=None):
        """Aktiviere oder deaktiviere einen Benutzer"""
        user = self.get_object()
        user.is_active = request.data.get('is_active', True)
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

# --- Neue View für Passwort Setzen --- #

class PasswordSetView(generics.GenericAPIView):
    """
    API View zum Setzen des Passworts und Aktivieren des Kontos.
    Nimmt uidb64, token und das neue Passwort entgegen.
    """
    permission_classes = [permissions.AllowAny] # Jeder kann darauf zugreifen
    serializer_class = None # Wird in post Methode gesetzt

    def post(self, request, uidb64, token, *args, **kwargs):
        from users.serializers import PasswordSetSerializer
        self.serializer_class = PasswordSetSerializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            # Token ist gültig
            user.set_password(serializer.validated_data['password'])
            user.is_active = True
            user.save()
            return Response({"message": "Passwort erfolgreich gesetzt und Konto aktiviert."}, status=status.HTTP_200_OK)
        else:
            # Ungültiger Token oder Benutzer
            return Response({"error": "Ungültiger oder abgelaufener Aktivierungslink."}, status=status.HTTP_400_BAD_REQUEST)

# --- Neue View zum initialen Passwort setzen --- #

class SetInitialPasswordView(generics.GenericAPIView):
    """
    API View für den authentifizierten Benutzer, um sein initiales Passwort zu setzen.
    Setzt auch force_password_change auf False.
    """
    serializer_class = InitialPasswordSetSerializer
    permission_classes = [permissions.IsAuthenticated] # Benutzer muss eingeloggt sein

    def post(self, request, *args, **kwargs):
        user = request.user
        print(f"[SET INITIAL PW] Anfrage von Benutzer '{user.username}' (ID: {user.id})")
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print(f"[SET INITIAL PW] Validierungsfehler: {e}")
            raise e

        # Setze das neue Passwort
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        print(f"[SET INITIAL PW] Neues Passwort für '{user.username}' gesetzt.")

        # Setze das Flag zurück
        try:
            profile = user.profile
            print(f"[SET INITIAL PW] Profil gefunden. Aktuelles force_password_change: {profile.force_password_change}")
            profile.force_password_change = False
            profile.save()
            print(f"[SET INITIAL PW] force_password_change für '{user.username}' auf False gesetzt.")
        except Profile.DoesNotExist:
            print(f"[SET INITIAL PW] WARNUNG: Profil für '{user.username}' nicht gefunden! Erstelle neues Profil.")
            Profile.objects.create(user=user, force_password_change=False)

        user.save()
        print(f"[SET INITIAL PW] Benutzer '{user.username}' gespeichert.")
        return Response({"message": "Passwort erfolgreich geändert."}, status=status.HTTP_200_OK)
