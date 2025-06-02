from django.shortcuts import render, get_object_or_404
from rest_framework import generics, views, status, viewsets, permissions
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import Exam, ExamAttempt, CriterionScore, ExamCriterion, ExamAttachment, ExamRequirement, CertificationPath
from .serializer import (
    ExamSerializer,
    ActiveExamAttemptSerializer,
    CompletedExamAttemptSerializer,
    TeacherSubmissionSerializer,
    TeacherGradingSerializer,
    CertificationPathSerializer
)
from django.db.models import Exists, OuterRef, Q, Prefetch
from django.utils import timezone

# Create your views here.
class AvailableExamsView(generics.ListAPIView):
    """
    Gibt eine Liste der Prüfungen zurück, die für den eingeloggten Benutzer verfügbar sind.
    Verfügbar = Keine vorherigen Versuche UND is_available_for() gibt True zurück.
    """
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"[DEBUG] AvailableExamsView: Lade verfügbare Prüfungen für Benutzer {user.username} (ID: {user.id})")
        
        # 1. Finde alle Prüfungs-IDs, für die der User *bereits einen Versuch* hat (egal welcher Status).
        attempted_exam_ids = ExamAttempt.objects.filter(
            user=user
        ).values_list('exam_id', flat=True).distinct() # distinct ist wichtig

        print(f"[DEBUG] AvailableExamsView: Prüfungen mit existierenden Versuchen (IDs): {list(attempted_exam_ids)}")

        # 2. Finde alle Prüfungen, die KEINEN Versuch vom User haben.
        exams_never_attempted = Exam.objects.exclude(
            id__in=attempted_exam_ids
        )
        print(f"[DEBUG] AvailableExamsView: Prüfungen ohne jeglichen Versuch vom User: {exams_never_attempted.count()}")


        # 3. Filtere diese weiter: Nur die, bei denen is_available_for True zurückgibt (Modul-Check).
        #    is_available_for prüft aktuell intern auch, ob ein 'started' Versuch existiert,
        #    aber da wir hier nur 'never_attempted' prüfen, ist dieser Teil der Prüfung
        #    redundant, aber schadet nicht. Der wichtige Teil ist der Modul-Check.
        available_exam_ids = []
        # Module vorladen für effiziente Prüfung in is_available_for
        potential_exams = exams_never_attempted.prefetch_related('modules__tasks') 
        print(f"[DEBUG] AvailableExamsView: Prüfe {potential_exams.count()} potenzielle (nie gestartete) Prüfungen auf Modulvoraussetzungen")
        
        for exam in potential_exams:
             print(f"[DEBUG] AvailableExamsView: Prüfe Prüfung {exam.id}: {exam.title}")
             # is_available_for prüft die Modulvoraussetzungen
             if exam.is_available_for(user):
                 print(f"[DEBUG] AvailableExamsView: Prüfung {exam.id} ist verfügbar (kein Versuch + Module OK)")
                 available_exam_ids.append(exam.id)
             else:
                 print(f"[DEBUG] AvailableExamsView: Prüfung {exam.id} ist NICHT verfügbar (wahrscheinlich Modul-Voraussetzungen nicht erfüllt)")
        
        # Gib das finale Queryset zurück (nur die, die nie versucht wurden UND verfügbar sind)
        # Lade auch die Relationen, die der Serializer benötigt
        final_queryset = Exam.objects.filter(id__in=available_exam_ids).prefetch_related('criteria', 'requirements', 'modules')
        
        # Debug-Info über das finale Ergebnis
        print(f"[DEBUG] AvailableExamsView: Anzahl final verfügbarer Prüfungen: {final_queryset.count()}")
        for exam in final_queryset:
            print(f"[DEBUG] AvailableExamsView: Verfügbare Prüfung - ID: {exam.id}, Titel: '{exam.title}'")
            
        return final_queryset

class ActiveExamsView(generics.ListAPIView):
    """
    Gibt eine Liste der Prüfungen zurück, die vom eingeloggten Benutzer gestartet wurden (Status 'started').
    """
    serializer_class = ActiveExamAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"[DEBUG] ActiveExamsView: Lade aktive Prüfungen für Benutzer {user.username}")
        
        active_attempts = ExamAttempt.objects.filter(
            user=user, 
            status=ExamAttempt.Status.STARTED
        ).select_related('exam').prefetch_related('exam__modules')
        
        print(f"[DEBUG] ActiveExamsView: Anzahl aktiver Prüfungen: {active_attempts.count()}")
        for attempt in active_attempts:
            print(f"[DEBUG] ActiveExamsView: Aktive Prüfung - ID: {attempt.id}, Exam: {attempt.exam.id} - '{attempt.exam.title}'")
        
        return active_attempts

class CompletedExamsView(generics.ListAPIView):
    """
    Gibt eine Liste der Prüfungen zurück, die vom eingeloggten Benutzer abgeschlossen wurden 
    (Status 'submitted' oder 'graded').
    """
    serializer_class = CompletedExamAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"[DEBUG] CompletedExamsView: Lade abgeschlossene Prüfungen für Benutzer {user.username}")
        
        completed_attempts = ExamAttempt.objects.filter(
            user=user, 
            status__in=[ExamAttempt.Status.SUBMITTED, ExamAttempt.Status.GRADED]
        ).select_related('exam').prefetch_related('exam__modules', 'criterion_scores__criterion', 'attachments')
        
        print(f"[DEBUG] CompletedExamsView: Anzahl abgeschlossener Prüfungen: {completed_attempts.count()}")
        
        return completed_attempts

# NEU: View für ALLE Prüfungen
class AllExamsListView(generics.ListAPIView):
    """
    Gibt eine Liste *aller* im System definierten Prüfungen zurück.
    Wird für den "Übersicht"-Tab im Frontend benötigt.
    Benötigt Authentifizierung, da die Prüfungstitel etc. nicht öffentlich sein sollen.
    """
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated] # Nur für eingeloggte Benutzer

    def get_queryset(self):
        print(f"[DEBUG] AllExamsListView: Lade ALLE Prüfungen")
        # Lade alle Prüfungen und die benötigten Relationen für den Serializer
        queryset = Exam.objects.all().prefetch_related('criteria', 'requirements', 'modules')
        print(f"[DEBUG] AllExamsListView: {queryset.count()} Prüfungen gefunden")
        return queryset

# --- Prüfungsaktionen Views ---

class StartExamView(views.APIView):
    """
    Startet eine neue Prüfung für den eingeloggten Benutzer.
    Überprüft zunächst, ob die Prüfung für den Benutzer verfügbar ist.
    Erstellt dann einen neuen ExamAttempt mit Status 'started'.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        # Lade die angeforderte Prüfung
        exam = get_object_or_404(Exam, pk=exam_id)
        user = request.user
        
        print(f"[DEBUG] StartExamView: Benutzer {user.username} versucht, Prüfung {exam_id} ({exam.title}) zu starten")

        # Prüfe, ob die Prüfung für den Benutzer verfügbar ist
        if not exam.is_available_for(user):
            print(f"[DEBUG] StartExamView: Prüfung {exam_id} ist NICHT verfügbar für Benutzer {user.username}")
            return Response(
                {"detail": "Diese Prüfung ist für Sie nicht verfügbar."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Erstelle einen neuen Prüfungsversuch
        attempt = ExamAttempt.objects.create(
            exam=exam,
            user=user,
            status=ExamAttempt.Status.STARTED
        )
        
        print(f"[DEBUG] StartExamView: Neuer Versuch {attempt.id} für Prüfung {exam_id} erstellt")

        # Serialisiere und gib den neuen Versuch zurück
        serializer = ActiveExamAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SubmitExamView(views.APIView):
    """
    Reicht einen Prüfungsversuch zur Bewertung ein.
    Setzt den Status auf 'submitted' und speichert ggf. Anhänge.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, attempt_id):
        # Lade den Versuch und stelle sicher, dass er dem aktuellen Benutzer gehört
        attempt = get_object_or_404(
            ExamAttempt,
            pk=attempt_id,
            user=request.user  # Sicherstellung, dass nur der eigene Versuch eingereicht werden kann
        )
        
        print(f"[DEBUG] SubmitExamView: Benutzer {request.user.username} versucht, Versuch {attempt_id} abzugeben")

        # Prüfe, ob der Status 'started' ist
        if attempt.status != ExamAttempt.Status.STARTED:
            print(f"[DEBUG] SubmitExamView: Versuch {attempt_id} hat Status {attempt.status}, muss aber 'started' sein")
            return Response(
                {"detail": "Nur gestartete Prüfungen können eingereicht werden."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Setze den Status auf 'submitted'
        attempt.status = ExamAttempt.Status.SUBMITTED
        attempt.submitted_at = timezone.now()
        attempt.save()
        
        print(f"[DEBUG] SubmitExamView: Versuch {attempt_id} erfolgreich auf 'submitted' gesetzt")

        # Verarbeitung von Dateianhängen (falls vorhanden)
        # TODO: Implementierung der Dateiverarbeitung, wenn benötigt

        # Serialisiere und gib den aktualisierten Versuch zurück
        serializer = CompletedExamAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)

# --- Teacher Views --- 

class TeacherSubmissionsListView(generics.ListAPIView):
    """
    Gibt eine Liste aller eingereichten UND bewerteten Prüfungsversuche zurück.
    Nur für Lehrer/Admins zugänglich.
    """
    serializer_class = TeacherSubmissionSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        print(f"[DEBUG] TeacherSubmissionsListView: Lade 'submitted' und 'graded' Versuche")
        # Korrigierter Filter: Schließe beide Status ein
        queryset = ExamAttempt.objects.filter(
            status__in=[ExamAttempt.Status.SUBMITTED, ExamAttempt.Status.GRADED]
        ).select_related('exam', 'user').prefetch_related('attachments', 'exam__criteria')

        print(f"[DEBUG] TeacherSubmissionsListView: {queryset.count()} Einreichungen (submitted/graded) gefunden")

        return queryset

class TeacherGradeAttemptView(views.APIView):
    """
    Ermöglicht einem Lehrer/Admin, einen eingereichten Prüfungsversuch zu bewerten.
    Nimmt eine Liste von Kriterium-Scores ({criterion_id, achieved_points}) 
    und optionales Feedback entgegen.
    Setzt den Status auf 'graded' und speichert die Bewertung.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, attempt_id):
        # Lade den Versuch und stelle sicher, dass Kriterien mitgeladen werden
        attempt = get_object_or_404(
            ExamAttempt.objects.select_related('exam').prefetch_related('exam__criteria'),
            pk=attempt_id
        )
        
        print(f"[DEBUG] TeacherGradeAttemptView: Admin {request.user.username} bewertet Versuch {attempt_id}")

        if attempt.status != ExamAttempt.Status.SUBMITTED:
            print(f"[DEBUG] TeacherGradeAttemptView: Versuch {attempt_id} hat Status {attempt.status}, nicht 'submitted'")
            return Response(
                {"detail": "This attempt has already been graded or was not submitted yet."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TeacherGradingSerializer(data=request.data, context={'attempt': attempt})
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            scores_data = validated_data.get('scores')
            feedback_data = validated_data.get('feedback', '')
            
            print(f"[DEBUG] TeacherGradeAttemptView: Bewerte Versuch {attempt_id} mit {len(scores_data)} Kriterien")

            # --- Bewertungslogik --- 
            CriterionScore.objects.filter(attempt=attempt).delete()

            for score_item in scores_data:
                # Verwende 'achieved_points' aus den validierten Daten
                CriterionScore.objects.create(
                    attempt=attempt,
                    criterion_id=score_item['criterion_id'],
                    achieved_points=score_item['achieved_points'] # Angepasst
                )
                print(f"[DEBUG] TeacherGradeAttemptView: Kriterium {score_item['criterion_id']}: {score_item['achieved_points']} Punkte")
            
            attempt.status = ExamAttempt.Status.GRADED
            attempt.feedback = feedback_data
            attempt.graded_by = request.user
            attempt.save() # Ruft _calculate_total_score und setzt graded_at
            
            print(f"[DEBUG] TeacherGradeAttemptView: Versuch {attempt_id} erfolgreich bewertet mit Gesamtpunktzahl {attempt.score}")

            # Gib den aktualisierten Versuch zurück
            response_serializer = TeacherSubmissionSerializer(attempt)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            print(f"[DEBUG] TeacherGradeAttemptView: Fehlerhafte Daten: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- NEU: ViewSet für Certification Paths ---

class CertificationPathViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API-Endpunkt, der Zertifikatspfade anzeigt.
    """
    queryset = CertificationPath.objects.prefetch_related(
        # Prüfungen innerhalb des Pfades vorladen und optional sortieren
        Prefetch('exams', queryset=Exam.objects.order_by('title')) 
    ).order_by('order', 'title') # Standard-Sortierung für die Pfade selbst
    serializer_class = CertificationPathSerializer
    permission_classes = [permissions.IsAuthenticated] # Nur für eingeloggte Benutzer? Anpassen nach Bedarf


# --- Alte Views (werden nicht mehr benötigt) --- 

# class ExamListView(generics.ListAPIView): # Bleibt ggf. für öffentliche Liste?
#     """
#     Gibt eine Liste aller verfügbaren Prüfungen zurück.
#     (Öffentlich zugänglich)
#     """
#     queryset = Exam.objects.all()
#     serializer_class = ExamSerializer

# class UserExamListView(generics.ListAPIView): # Ersetzt durch spezifischere Views
#     """
#     Gibt eine Liste aller Prüfungen für den aktuell eingeloggten Benutzer zurück,
#     inklusive des Status (available, started, submitted, graded) und Attempt-Details.
#     """
#     serializer_class = UserExamStatusSerializer
#     permission_classes = [IsAuthenticated] # Nur für eingeloggte Benutzer
# 
#     def get_queryset(self):
#         return Exam.objects.all()
# 
#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context.update({"request": self.request})
#         return context
