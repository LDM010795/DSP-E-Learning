from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Exam, ExamCriterion, ExamAttempt, ExamAttachment, CriterionScore

class ExamCriterionInline(admin.TabularInline):
    model = ExamCriterion
    extra = 1
    fields = ('title', 'description', 'max_points')

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'duration_weeks', 'created_at', 'get_module_count')
    list_filter = ('difficulty', 'created_at')
    search_fields = ('title', 'description')
    filter_horizontal = ('modules',)
    fieldsets = (
        (_('Grundinformationen'), {
            'fields': ('title', 'description', 'difficulty', 'duration_weeks')
        }),
        (_('Module-Voraussetzungen'), {
            'fields': ('modules',),
            'description': _('Module, die der Benutzer absolviert haben muss, um diese Prüfung zu starten. Kein Modul = keine Voraussetzungen.')
        }),
    )
    inlines = [ExamCriterionInline]
    
    def get_module_count(self, obj):
        count = obj.modules.count()
        return count if count > 0 else _('Keine Voraussetzungen')
    get_module_count.short_description = _('Module')

class CriterionScoreInline(admin.TabularInline):
    model = CriterionScore
    extra = 1
    fields = ('criterion', 'achieved_points')
    autocomplete_fields = ('criterion',)

class ExamAttachmentInline(admin.TabularInline):
    model = ExamAttachment
    extra = 1
    fields = ('file', 'uploaded_at')
    readonly_fields = ('uploaded_at',)

@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'exam', 'status', 'started_at', 'submitted_at', 'graded_at', 'score')
    list_filter = ('status', 'started_at', 'submitted_at')
    search_fields = ('user__username', 'exam__title')
    readonly_fields = ('started_at', 'submitted_at', 'graded_at', 'score', 'processing_time_days', 'due_date', 'remaining_days')
    fieldsets = (
        (_('Versuch-Information'), {
            'fields': ('user', 'exam', 'status')
        }),
        (_('Zeitstempel'), {
            'fields': ('started_at', 'submitted_at', 'graded_at', 'processing_time_days', 'due_date', 'remaining_days'),
            'classes': ('collapse',)
        }),
        (_('Bewertung'), {
            'fields': ('score', 'feedback', 'graded_by')
        }),
    )
    inlines = [CriterionScoreInline, ExamAttachmentInline]
    
    def has_add_permission(self, request):
        # Neue Versuche sollten über die API erstellt werden, nicht manuell im Admin
        return False

@admin.register(ExamCriterion)
class ExamCriterionAdmin(admin.ModelAdmin):
    list_display = ('title', 'exam', 'max_points')
    list_filter = ('exam',)
    search_fields = ('title', 'description', 'exam__title')
    autocomplete_fields = ('exam',)

# Optional registrieren, falls du direkten Zugriff auf die Scores oder Anhänge benötigst
@admin.register(CriterionScore)
class CriterionScoreAdmin(admin.ModelAdmin):
    list_display = ('criterion', 'attempt', 'achieved_points')
    list_filter = ('criterion__exam', 'attempt__status')
    search_fields = ('criterion__title', 'attempt__user__username')
    autocomplete_fields = ('attempt', 'criterion')

@admin.register(ExamAttachment)
class ExamAttachmentAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'file', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('attempt__user__username', 'attempt__exam__title')
    autocomplete_fields = ('attempt',)
