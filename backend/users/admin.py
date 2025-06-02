from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from .models import Profile # Importiere das Profile-Modell

# Register your models here.

# Inline Admin für das Profil
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profil'
    fk_name = 'user'
    fields = ('force_password_change',)

# Definiere eine neue UserAdmin-Klasse
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'get_force_password_change')
    list_select_related = ('profile',)
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'profile__force_password_change')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

    def get_force_password_change(self, instance):
        try:
            return instance.profile.force_password_change
        except Profile.DoesNotExist:
            return None
    get_force_password_change.boolean = True # Zeigt es als Icon an
    get_force_password_change.short_description = 'Passwortänderung erzwingen' # Spaltenüberschrift

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(UserAdmin, self).get_inline_instances(request, obj)

# Registriere UserAdmin neu
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Registriere Profile separat (optional, falls man Profile direkt bearbeiten will)
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'force_password_change')
    search_fields = ('user__username', 'user__email')
