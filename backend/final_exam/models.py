from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone # Import timezone
import datetime # Import datetime

# from modules.models import Module   # ACHTUNG: Diese App/Modell existiert möglicherweise nicht

# Annahme: Die App 'modules' und das Modell 'Module' existieren.
# Stelle sicher, dass die App in INSTALLED_APPS ist.
try:
    from modules.models import Module, Task, UserTaskProgress 
except ImportError:
    # Fallback, wenn die App/das Modell nicht existiert. Module können nicht geprüft werden.
    Module = None
    Task = None # Task auch auf None setzen
    UserTaskProgress = None # UserTaskProgress auch auf None setzen
    print("WARNING: Could not import models from 'modules.models'. Module prerequisite checks are disabled.")

User = get_user_model()


class ExamDifficulty(models.TextChoices):
    EASY = "easy", _("Einfach")
    MEDIUM = "medium", _("Mittel")
    HARD = "hard", _("Schwer")


class Exam(models.Model):
    """
    Grunddefintion einer Prüfung.
    Wird über die Many-to-Many-Beziehung `modules` an Lernmodule gekoppelt.
    Sobald ein*e Nutzer*in alle Module abgeschlossen hat, kann er/sie die Prüfung starten.
    """
    title = models.CharField(max_length=255, unique=True)
    # Dauer in Wochen – bewusst Integer, um flexibel zu bleiben
    duration_weeks = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)],
        help_text=_("Bearbeitungszeit ab Start in vollen Wochen."),
    )
    difficulty = models.CharField(
        max_length=10, choices=ExamDifficulty.choices, default=ExamDifficulty.MEDIUM
    )
    description = models.TextField()
    # modules = models.ManyToManyField(  # ACHTUNG: Abhängigkeit von 'modules'-App
    #     Module,
    #     related_name="exams",
    #     help_text=_(
    #         "Alle Module, die vor Start dieser Prüfung absolviert sein müssen."
    #     ),
    # )

    # Modul-Beziehung wieder aktivieren (oder anpassen, falls Name anders ist)
    modules = models.ManyToManyField(
        Module, # Verwendet das importierte (oder None) Module-Modell
        blank=True, # Erlaubt Prüfungen ohne Modulzuweisung
        related_name="exams",
        help_text=_( 
            "Module, die vor Start dieser Prüfung absolviert sein müssen (optional)."
        ),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Exam")
        verbose_name_plural = _("Exams")
        ordering = ["title"]

    def __str__(self):
        return self.title

    # Business-Logik – Kann die/der Nutzer*in die Prüfung starten?
    def is_available_for(self, user: User) -> bool:
        """
        Gibt True zurück, wenn die Prüfung für den Benutzer verfügbar ist.
        Bedingungen:
        1. Benutzer ist authentifiziert.
        2. Es gibt keinen Versuch mit Status 'started' für diese Prüfung vom Benutzer.
        3. Entweder hat die Prüfung keine zugehörigen Module ODER der Benutzer hat alle
           Tasks in allen erforderlichen Modulen abgeschlossen.
        """
        # Prüfung 1: Authentifizierung
        if not user or not user.is_authenticated:
            return False

        # Prüfung 2: Gibt es bereits einen 'started' Attempt?
        has_started_attempt = ExamAttempt.objects.filter(
            exam=self,
            user=user,
            status=ExamAttempt.Status.STARTED,
        ).exists()
        if has_started_attempt:
            return False

        # Prüfung 3: Modul-Abhängigkeiten
        required_modules = self.modules.all()
        if not required_modules.exists():
            return True # Keine Module erforderlich -> verfügbar

        # Stelle sicher, dass alle benötigten Modelle importiert werden konnten
        if Module is None or Task is None or UserTaskProgress is None:
             print(f"DEBUG: Exam {self.id} cannot check module prerequisites because models from 'modules' app are unavailable.")
             return False

        # --- Tatsächliche Prüfung der Modul-Voraussetzungen ---
        # Iteriere über jedes erforderliche Modul
        for module in required_modules.prefetch_related('tasks'): # Tasks vorab laden
            all_task_ids_for_module = set(module.tasks.values_list('id', flat=True))

            # Wenn ein erforderliches Modul keine Tasks hat, kann es nicht abgeschlossen werden?
            # ODER zählt es als abgeschlossen? Hier Annahme: Muss Tasks haben ODER gilt als "nicht blockierend".
            # Wenn es keine Tasks gibt, überspringen wir die Prüfung für dieses Modul (es blockiert nicht).
            if not all_task_ids_for_module:
                continue # Zum nächsten Modul

            # Finde alle vom User abgeschlossenen Tasks *innerhalb dieses Moduls*
            completed_task_ids_for_module = set(
                UserTaskProgress.objects.filter(
                    user=user,
                    task_id__in=all_task_ids_for_module, # Nur Tasks dieses Moduls
                    completed=True
                ).values_list('task_id', flat=True)
            )

            # Prüfen, ob ALLE Task-IDs des Moduls in den abgeschlossenen IDs enthalten sind
            if not all_task_ids_for_module.issubset(completed_task_ids_for_module):
                # Mindestens ein Task in diesem Modul ist nicht abgeschlossen
                # print(f"DEBUG: User {user.id} has not completed Module {module.id} for Exam {self.id}. Missing tasks: {all_task_ids_for_module - completed_task_ids_for_module}")
                return False # Prüfung nicht verfügbar

        # Wenn die Schleife durchläuft, sind alle Module abgeschlossen
        return True


class ExamAttempt(models.Model):
    """
    Speichert die Prüfungsteilnahme eines Users.
    Ein Attempt – mehrere Status-Übergänge.
    Bewertung & Kommentare können nach Abgabe ergänzt werden.
    """

    class Status(models.TextChoices):
        STARTED = "started", _("Gestartet")
        SUBMITTED = "submitted", _("Abgegeben")
        GRADED = "graded", _("Bewertet")

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="attempts")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="exam_attempts")

    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.STARTED
    )

    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    # Bewertung
    score = models.DecimalField(
        max_digits=7, # Ggf. erhöhen, falls Summe der max_points sehr groß wird
        decimal_places=2,
        null=True,
        blank=True,
        # Angepasster Hilfetext
        help_text=_("Gesamtpunktzahl (Summe der erreichten Punkte aller Kriterien). Wird automatisch berechnet."),
    )
    feedback = models.TextField(blank=True, null=True)
    graded_by = models.ForeignKey(
        User,
        related_name="graded_exam_attempts",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text=_("Wer die Bewertung vorgenommen hat."),
    )

    # --- Calculated Properties --- 
    @property
    def due_date(self):
        """Berechnet das Fälligkeitsdatum basierend auf Startdatum und Dauer.
           Gibt None zurück, wenn keine Dauer im Exam definiert ist.
        """
        if self.started_at and self.exam and self.exam.duration_weeks:
            return self.started_at + datetime.timedelta(weeks=self.exam.duration_weeks)
        return None

    @property
    def remaining_days(self):
        """Berechnet die verbleibenden Tage bis zum Fälligkeitsdatum.
           Gibt None zurück, wenn kein Fälligkeitsdatum vorhanden ist.
           Kann negativ werden, wenn das Datum überschritten ist.
        """
        due = self.due_date
        if due:
            now = timezone.now()
            # Stelle sicher, dass beide aware oder naive sind (standardmäßig sind beide aware dank Django)
            delta = due - now
            return delta.days # Gibt die Differenz als ganze Tage zurück
        return None

    @property
    def processing_time_days(self):
        """Berechnet die Bearbeitungszeit in Tagen zwischen Start und Abgabe.
           Gibt None zurück, wenn Start- oder Abgabedatum fehlen.
        """
        if self.started_at and self.submitted_at:
            delta = self.submitted_at - self.started_at
            # delta.days gibt nur die ganzen Tage zurück. Wenn weniger als 24h,
            # wäre das 0. Ggf. muss hier anders gerechnet werden, wenn Stunden/Minuten zählen.
            # Für ganze Tage ist .days korrekt.
            return delta.days
        return None

    # --- Helper method to calculate score --- 
    def _calculate_total_score(self) -> float:
        """
        Aggregiert alle erreichten Punkte der CriterionScores -> Gesamtpunktzahl.
        Gibt den berechneten Score zurück, speichert NICHT.
        """
        # Summiert jetzt `achieved_points` statt `weighted_points`
        total = sum(cs.achieved_points for cs in self.criterion_scores.all() if cs.achieved_points is not None)
        # Keine Rundung nötig, wenn achieved_points Decimal ist, aber schadet nicht
        # Wenn achieved_points Integer ist, ist das Ergebnis Integer
        return round(total, 2) 

    # --- Overridden save method ---
    def save(self, *args, **kwargs):
        """
        Berechnet den Gesamtscore neu, wenn der Status auf GRADED gesetzt wird.
        Setzt graded_at, wenn Status auf GRADED wechselt.
        Setzt submitted_at, wenn Status auf SUBMITTED wechselt.
        """
        is_new = self._state.adding
        original_status = None
        if not is_new:
            try:
                original_status = ExamAttempt.objects.get(pk=self.pk).status
            except ExamAttempt.DoesNotExist:
                pass # Sollte nicht passieren, wenn nicht is_new
        
        # Zeitstempel setzen bei Statuswechsel
        if self.status == self.Status.SUBMITTED and original_status != self.Status.SUBMITTED:
            self.submitted_at = timezone.now()
        elif self.status == self.Status.GRADED and original_status != self.Status.GRADED:
            self.graded_at = timezone.now()
            # Score nur bei Statuswechsel zu GRADED oder wenn schon GRADED berechnen
            self.score = self._calculate_total_score()
        elif self.status == self.Status.GRADED: # Auch bei erneutem Speichern im GRADED Status neu berechnen
             self.score = self._calculate_total_score()

        super().save(*args, **kwargs)

    # --- String representation ---
    def __str__(self):
        return f"{self.user} – {self.exam} ({self.get_status_display()})"


# Neue Model für Prüfungsanforderungen
class ExamRequirement(models.Model):
    """
    Eine spezifische Anforderung für eine Prüfung.
    """
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="requirements")
    description = models.TextField(help_text=_("Beschreibung der Anforderung."))
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text=_("Reihenfolge der Anzeige der Anforderung.")
    )

    class Meta:
        verbose_name = _("Exam Requirement")
        verbose_name_plural = _("Exam Requirements")
        ordering = ["exam", "order"] # Standard-Sortierung

    def __str__(self):
        return f"{self.exam.title} - Requirement {self.order}: {self.description[:50]}..."


# Optional: separates Modell für Datei-Uploads (z. B. PDF-Lösungen)
class ExamAttachment(models.Model):
    attempt = models.ForeignKey(
        ExamAttempt, on_delete=models.CASCADE, related_name="attachments"
    )
    file = models.FileField(upload_to="exam_uploads/%Y/%m/%d")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Exam Attachment")
        verbose_name_plural = _("Exam Attachments")
        ordering = ["uploaded_at"]

    def __str__(self):
        return f"{self.file.name}"


class ExamCriterion(models.Model):
    """
    Bewertungs-Kriterium pro Prüfung mit maximaler Punktzahl.
    Die Summe der max_points aller Kriterien einer Prüfung ergibt die maximal
    erreichbare Gesamtpunktzahl der Prüfung.
    """
    exam = models.ForeignKey(
        Exam, on_delete=models.CASCADE, related_name="criteria"
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    # Ersetzt 'weight' durch 'max_points'
    max_points = models.PositiveIntegerField(
        default=10, # Beispiel-Defaultwert
        validators=[MinValueValidator(1)],
        help_text=_("Maximal erreichbare Punktzahl für dieses Kriterium.")
    )

    class Meta:
        verbose_name = _("Exam Criterion")
        verbose_name_plural = _("Exam Criteria")
        unique_together = ("exam", "title")
        ordering = ["exam", "title"]

    def __str__(self):
        # Angepasste String-Repräsentation
        return f"{self.exam.title} – {self.title} (max. {self.max_points} Pkt.)"


class CriterionScore(models.Model):
    """
    Erreichte Punktzahl je Kriterium für einen ExamAttempt.
    Muss zwischen 0 und den max_points des Kriteriums liegen.
    """
    attempt = models.ForeignKey(
        ExamAttempt, on_delete=models.CASCADE, related_name="criterion_scores"
    )
    criterion = models.ForeignKey(
        ExamCriterion, on_delete=models.CASCADE, related_name="scores"
    )
    # Ersetzt 'score' (Prozent) durch 'achieved_points' (absolute Punkte)
    achieved_points = models.DecimalField(
        max_digits=5, # Sollte max_points des Kriteriums abdecken können
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_("Erreichte Punktzahl für dieses Kriterium.")
    )

    class Meta:
        verbose_name = _("Criterion Score")
        verbose_name_plural = _("Criterion Scores")
        unique_together = ("attempt", "criterion")
        ordering = ["attempt", "criterion"]

    def __str__(self):
        # Angepasste String-Repräsentation
        return (
            f"{self.attempt} – {self.criterion.title}: "
            f"{self.achieved_points}/{self.criterion.max_points} Pkt."
        )

    # --- Validierung --- 
    def clean(self):
        """Stellt sicher, dass achieved_points <= criterion.max_points ist."""
        super().clean()
        if self.achieved_points is not None and self.criterion is not None:
            if self.achieved_points > self.criterion.max_points:
                raise ValidationError({
                    'achieved_points': _(
                        f"Erreichte Punkte ({self.achieved_points}) dürfen nicht größer sein als "
                        f"die maximalen Punkte ({self.criterion.max_points}) des Kriteriums."
                    )
                })

    def save(self, *args, **kwargs):
        """Ruft full_clean zur Validierung vor dem Speichern auf."""
        self.full_clean() 
        super().save(*args, **kwargs)


# --- Neues Modell für Zertifikatspfade ---

class CertificationPath(models.Model):
    """
    Repräsentiert einen logischen Lernpfad, der aus mehreren Abschlussprüfungen (Exams)
    bestehen kann.
    """
    title = models.CharField(
        max_length=200,
        unique=True,
        help_text=_("Titel des Zertifikatspfads (z.B. Backend Developer Profi)")
    )
    description = models.TextField(
        blank=True,
        help_text=_("Kurze Beschreibung, was dieser Pfad abdeckt.")
    )
    # ManyToMany zu Exam, um die Prüfungen im Pfad zu definieren
    exams = models.ManyToManyField(
        Exam,
        related_name="certification_paths",
        blank=True, # Ein Pfad könnte initial leer sein
        help_text=_("Die Abschlussprüfungen, die Teil dieses Pfades sind.")
    )
    # Optional: Feld für die Sortierreihenfolge der Pfade in Listen
    order = models.PositiveSmallIntegerField(
        default=0,
        db_index=True,
        help_text=_("Reihenfolge für die Anzeige (kleinere Zahlen zuerst).")
    )
    # Optional: Feld für ein Icon (z.B. Name einer Icon-Komponente im Frontend)
    icon_name = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text=_("Name des Icons für das Frontend (z.B. IoCodeSlashOutline).")
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Certification Path")
        verbose_name_plural = _("Certification Paths")
        ordering = ["order", "title"] # Standard-Sortierung

    def __str__(self):
        return self.title
