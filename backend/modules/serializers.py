from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Module, Content, SupplementaryContent, Task, UserTaskProgress

# Basic Serializers (for content structure)

class SupplementaryContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplementaryContent
        fields = ['id', 'label', 'url', 'order']

class ContentSerializer(serializers.ModelSerializer):
    supplementary_contents = SupplementaryContentSerializer(many=True, read_only=True)

    class Meta:
        model = Content
        fields = ['id', 'video_url', 'title', 'description', 'supplementary_title', 'order', 'supplementary_contents']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'difficulty', 'hint', 'order']

# Serializers including User-Specific Data

class UserSpecificTaskSerializer(TaskSerializer):
    """ Erweitert TaskSerializer um den user-spezifischen Abschlussstatus. """
    # Umbenannt zu 'completed' für Konsistenz mit Frontend-Kontext
    completed = serializers.SerializerMethodField(method_name='get_user_completed') 
    # user_completed_at wird nicht mehr benötigt oder könnte ähnlich implementiert werden

    class Meta(TaskSerializer.Meta):
        # Füge 'completed' hinzu, entferne alte Feldnamen
        fields = TaskSerializer.Meta.fields + ['completed'] 

    def get_user_completed(self, obj: Task) -> bool:
        """
        Prüft, ob der aktuell anfragende Benutzer diese Aufgabe abgeschlossen hat.
        Benötigt 'request' im Serializer-Kontext.
        """
        # Hole den User aus dem Kontext
        request = self.context.get('request', None)
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return False # Kein User oder nicht angemeldet
        
        user = request.user
        # Direkte DB-Abfrage für den Abschlussstatus
        return UserTaskProgress.objects.filter(
            user=user, 
            task=obj, 
            completed=True
        ).exists()

class ModuleSerializer(serializers.ModelSerializer):
    """ Basis Modul Serializer (ohne User-Kontext). """
    contents = ContentSerializer(many=True, read_only=True)
    # Verwendet den Basis TaskSerializer
    tasks = TaskSerializer(many=True, read_only=True) 

    class Meta:
        model = Module
        fields = ['id', 'title', 'category', 'is_public', 'contents', 'tasks']

class UserSpecificModuleSerializer(serializers.ModelSerializer):
    """ Detaillierter Modul Serializer mit User-Fortschritt. """
    is_user_accessible = serializers.SerializerMethodField()
    # user_progress_percent entfernt, da es ineffizient sein kann und user_progress_map nicht mehr verwendet wird.
    # Könnte später bei Bedarf performant hinzugefügt werden (z.B. über Annotation in der View).
    contents = ContentSerializer(many=True, read_only=True)
    # Stellt sicher, dass der UserSpecificTaskSerializer verwendet wird
    tasks = UserSpecificTaskSerializer(many=True, read_only=True) 

    class Meta:
        model = Module
        fields = [
            'id', 'title', 'category', 'is_user_accessible',
            # 'user_progress_percent', # Entfernt
            'contents', 'tasks'
        ]

    def get_is_user_accessible(self, obj: Module) -> bool:
        """
        Prüft, ob der User auf das Modul zugreifen kann.
        Benötigt 'request' im Serializer-Kontext.
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.check_user_accessibility(request.user)
        return obj.is_public # Fallback für anonyme oder fehlenden Request

    # get_user_progress_percent wurde entfernt. Die Berechnung erfolgt nun 
    # entweder im Frontend oder muss performant in der View vorbereitet werden. 