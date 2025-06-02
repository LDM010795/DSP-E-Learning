from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Prefetch
from ..models import Module, Task, UserTaskProgress
from ..serializers import ModuleSerializer, UserSpecificModuleSerializer
from rest_framework.permissions import IsAuthenticated

class ModuleListViewPublic(generics.ListAPIView):
    """
    List all modules (basic info) regardless of user access.
    Useful for an admin interface or a public overview.
    """
    queryset = Module.objects.all().prefetch_related(
        Prefetch('tasks', queryset=Task.objects.order_by('order', 'title')),
        'contents__supplementary_contents'
    ).order_by('title')
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

class ModuleDetailViewPublic(generics.RetrieveAPIView):
    """
    Retrieve a single module (basic info) regardless of user access.
    """
    queryset = Module.objects.all().prefetch_related(
        Prefetch('tasks', queryset=Task.objects.order_by('order', 'title')),
        'contents__supplementary_contents'
    )
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk' # Or 'title' if you want to use the title for lookup


class UserModuleListView(generics.ListAPIView):
    """
    List modules accessible to the currently authenticated user,
    including their progress and detailed content/tasks.
    """
    serializer_class = UserSpecificModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """ Return ALL modules, letting the serializer handle user-specific access display. """
        # user = self.request.user # No longer needed for filtering queryset
        # Prefetch related data for efficiency on ALL modules
        return Module.objects.all().prefetch_related( # Changed from get_accessible_modules_for_user
            Prefetch('tasks', queryset=Task.objects.order_by('order', 'title')),
            'contents__supplementary_contents' # Prefetch contents and their supplementary content
        ).order_by('title') # Ensure consistent ordering

    def get_serializer_context(self):
        """ Pass user progress data to the serializer context. """
        context = super().get_serializer_context()
        user = self.request.user
        queryset = self.get_queryset() # Get the already filtered modules

        # Fetch all tasks for the accessible modules efficiently
        all_tasks = Task.objects.filter(module__in=queryset)
        all_task_ids = [task.id for task in all_tasks]

        # Create a map of module_id -> list of tasks for progress calculation
        all_module_tasks_map = {}
        for task in all_tasks:
            if task.module_id not in all_module_tasks_map:
                all_module_tasks_map[task.module_id] = []
            all_module_tasks_map[task.module_id].append(task)

        # Fetch user progress for all relevant tasks in one go
        user_progress = UserTaskProgress.objects.filter(
            user=user,
            task_id__in=all_task_ids
        ).values('task_id', 'completed', 'completed_at')

        # Create a map for quick lookup in the serializer
        progress_map = {
            entry['task_id']: {'completed': entry['completed'], 'completed_at': entry['completed_at']}
            for entry in user_progress
        }

        context['user_progress_map'] = progress_map
        context['all_module_tasks'] = all_module_tasks_map
        return context

class UserModuleDetailView(generics.RetrieveAPIView):
    """
    Retrieve a single module accessible to the currently authenticated user,
    including their progress and detailed content/tasks.
    """
    serializer_class = UserSpecificModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        """ Return the specific module by pk, letting the serializer handle access display. """
        # user = self.request.user # No longer needed for filtering queryset
        # Prefetch related data for the specific module(s) found by pk
        # We return all modules here, DRF's RetrieveAPIView handles filtering by pk
        return Module.objects.all().prefetch_related(
            Prefetch('tasks', queryset=Task.objects.order_by('order', 'title')),
            'contents__supplementary_contents'
        )

    def get_serializer_context(self):
        """ Pass user progress data to the serializer context for the single module. """
        context = super().get_serializer_context()
        user = self.request.user
        module_pk = self.kwargs.get('pk') # Get module PK from URL

        # Fetch tasks for this specific module
        module_tasks = Task.objects.filter(module_id=module_pk).order_by('order', 'title')
        all_task_ids = [task.id for task in module_tasks]

        # Fetch user progress for these tasks
        user_progress = UserTaskProgress.objects.filter(
            user=user,
            task_id__in=all_task_ids
        ).values('task_id', 'completed', 'completed_at')

        progress_map = {
            entry['task_id']: {'completed': entry['completed'], 'completed_at': entry['completed_at']}
            for entry in user_progress
        }

        # Create the module_tasks map for the serializer
        all_module_tasks_map = {module_pk: list(module_tasks)}

        context['user_progress_map'] = progress_map
        context['all_module_tasks'] = all_module_tasks_map # Map containing only the current module's tasks
        return context 