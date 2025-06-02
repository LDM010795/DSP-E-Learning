from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.db.models import Exists, OuterRef # Import needed for efficient check

# Create your models here.

class Module(models.Model):
    """Represents a learning module."""
    # NEU: Kategorien für Module
    class ModuleCategory(models.TextChoices):
        PYTHON = 'Python', _('Python')
        WEB_DEV = 'Web Development', _('Web Development')
        DATA_SCIENCE = 'Data Science', _('Data Science')
        DEVOPS = 'DevOps & Tools', _('DevOps & Tools')
        SONSTIGES = 'Sonstiges', _('Sonstiges')

    title = models.CharField(
        max_length=200,
        unique=True,
        help_text=_("The unique title of the module.")
    )
    # NEU: Kategorie-Feld
    category = models.CharField(
        max_length=50,
        choices=ModuleCategory.choices,
        default=ModuleCategory.SONSTIGES,
        help_text=_("The category this module belongs to.")
    )
    is_public = models.BooleanField(
        default=True,
        help_text=_(
            "If True, the module is accessible to all authenticated users. "
            "If False, access is restricted based on ModuleAccess entries."
        )
    )

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _("Module")
        verbose_name_plural = _("Modules")
        ordering = ['title']
        # ordering = ['category', 'title'] # Optional: Standard-Sortierung anpassen

    def check_user_accessibility(self, user):
        """Checks if a given user can access this module."""
        if not user or not user.is_authenticated:
            # Decide if anonymous users can access public modules (assuming yes here)
            return self.is_public
        if self.is_public:
            return True
        # For non-public modules, check explicit assignment via ModuleAccess
        return ModuleAccess.objects.filter(module=self, user=user).exists()

    @staticmethod
    def get_accessible_modules_for_user(user):
        """Returns a queryset of modules accessible by the given user."""
        if not user or not user.is_authenticated:
            # Return only public modules for anonymous users
            return Module.objects.filter(is_public=True)

        # For authenticated users, return public modules OR modules they have explicit access to
        return Module.objects.filter(
            models.Q(is_public=True) |
            models.Q(pk__in=ModuleAccess.objects.filter(user=user).values('module_id'))
        ).distinct()


class ModuleAccess(models.Model):
    """Explicitly defines which user has access to which non-public module."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='module_access_entries')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='access_permissions')
    granted_at = models.DateTimeField(auto_now_add=True, help_text=_("Timestamp when access was granted"))

    def __str__(self):
        return f"Access for {self.user.username} to {self.module.title}"

    class Meta:
        verbose_name = _("Module Access Permission")
        verbose_name_plural = _("Module Access Permissions")
        # Ensure a user can only have one access entry per module
        unique_together = ('user', 'module')
        ordering = ['user', 'module']


class Content(models.Model):
    """Represents a piece of content within a module (e.g., video, text)."""
    module = models.ForeignKey(Module, related_name='contents', on_delete=models.CASCADE)
    video_url = models.URLField(max_length=500, blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    supplementary_title = models.CharField(max_length=200, blank=True, null=True)
    order = models.PositiveIntegerField(
        default=0,
        help_text=_("Optional field to define the order of content within a module.")
    )

    def __str__(self):
        return f"{self.module.title} - {self.title}"

    class Meta:
        verbose_name = _("Content")
        verbose_name_plural = _("Contents")
        # Unique title within a module might be desirable
        unique_together = ('module', 'title')
        ordering = ['module', 'order', 'title']


class SupplementaryContent(models.Model):
    """Represents a supplementary resource link for a Content item."""
    content = models.ForeignKey(Content, related_name='supplementary_contents', on_delete=models.CASCADE)
    label = models.CharField(max_length=200)
    url = models.URLField(max_length=500)
    order = models.PositiveIntegerField(
        default=0,
        help_text=_("Optional field to define the order of supplementary links.")
    )

    def __str__(self):
        return f"{self.content.title} - {self.label}"

    class Meta:
        verbose_name = _("Supplementary Content")
        verbose_name_plural = _("Supplementary Contents")
        ordering = ['content', 'order', 'label']


class Task(models.Model):
    """Represents a task or exercise associated with a module."""
    class Difficulty(models.TextChoices):
        EASY = 'Einfach', _('Easy')
        MEDIUM = 'Mittel', _('Medium')
        HARD = 'Schwer', _('Hard')

    module = models.ForeignKey(Module, related_name='tasks', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(
        max_length=10,
        choices=Difficulty.choices,
        default=Difficulty.MEDIUM,
    )
    hint = models.TextField(blank=True, null=True)
    test_file_path = models.CharField(
        max_length=255,
        blank=True,
        help_text=_(
            "Relative path from the 'modules' app directory to the python file containing unittest cases. "
            "E.g., 'task_tests/module1/task10_tests.py'"
        )
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text=_("Optional field to define the order of tasks within a module.")
    )

    def __str__(self):
        return f"{self.module.title} - Task: {self.title}"

    class Meta:
        verbose_name = _("Task")
        verbose_name_plural = _("Tasks")
        # Unique title within a module might be desirable
        unique_together = ('module', 'title')
        ordering = ['module', 'order', 'title']


class UserTaskProgress(models.Model):
    """Tracks the completion status of tasks for each user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_progress')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='user_progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True, help_text=_("Timestamp when the task was marked as completed"))

    def __str__(self):
        status = _("Completed") if self.completed else _("Not Completed")
        return f"{self.user.username} - {self.task.title} ({status})"

    class Meta:
        verbose_name = _("User Task Progress")
        verbose_name_plural = _("User Task Progresses")
        # Ensure a user can only have one progress entry per task
        unique_together = ('user', 'task')
        ordering = ['user', 'task']
