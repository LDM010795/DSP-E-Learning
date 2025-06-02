from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    force_password_change = models.BooleanField(default=True)
    # Hier können später weitere Profilfelder hinzugefügt werden

    def __str__(self):
        return f'{self.user.username} Profile'

# Signal, um automatisch ein Profil zu erstellen, wenn ein Benutzer erstellt wird
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# Signal, um das Profil zu speichern, wenn der Benutzer gespeichert wird (gute Praxis)
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        # Falls das Profil aus irgendeinem Grund fehlt, erstelle es jetzt.
        Profile.objects.create(user=instance)
