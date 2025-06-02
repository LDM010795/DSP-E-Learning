from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.conf import settings
from .models import Profile

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['force_password_change']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer für das Django User-Modell.
    Wird für die CRUD-Operationen in der UserCrudViewSet verwendet.
    """
    password = serializers.CharField(write_only=True, required=True, min_length=8, style={'input_type': 'password'})
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', # Passwort wieder hinzugefügt
            'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'groups', 'profile'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'profile']

    def create(self, validated_data):
        # Kommentar angepasst: User.objects.create_user hasht das Passwort selbst.
        # Benutzer wird standardmäßig aktiv erstellt (Standard von create_user)
        # Profil wird automatisch durch Signal erstellt, force_password_change ist default=True
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        # Passwort optional aktualisieren
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        # Andere Felder aktualisieren
        return super().update(instance, validated_data)

class InitialPasswordSetSerializer(serializers.Serializer):
    """
    Serializer zum Setzen des Passworts beim ersten Login.
    Benötigt Authentifizierung.
    """
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Passwörter stimmen nicht überein.")
        # Hier könnten weitere Passwort-Validierungen hinzugefügt werden
        return data 