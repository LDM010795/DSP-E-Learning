from django.urls import path, include
# Router import nicht mehr nötig, wenn nicht anderweitig verwendet
# from rest_framework.routers import DefaultRouter
from .views import (
    AvailableExamsView,
    ActiveExamsView,
    CompletedExamsView,
    AllExamsListView,
    StartExamView,
    SubmitExamView,
    TeacherSubmissionsListView,
    TeacherGradeAttemptView,
    CertificationPathViewSet,
)

# Router wird nicht mehr benötigt für diesen Zweck
# router = DefaultRouter()
# router.register(r'certification-paths', CertificationPathViewSet, basename='certification-path') # Entfernt

urlpatterns = [
    # API-Endpunkte, die keine ViewSets sind (ListAPIView, APIView)
    path('my-exams/available/', AvailableExamsView.as_view(), name='my-available-exams'),
    path('my-exams/active/', ActiveExamsView.as_view(), name='my-active-exams'),
    path('my-exams/completed/', CompletedExamsView.as_view(), name='my-completed-exams'),
    path('all/', AllExamsListView.as_view(), name='all-exams-list'), # Endpunkt für alle Prüfungen
    path('<int:exam_id>/start/', StartExamView.as_view(), name='start-exam'),
    path('attempts/<int:attempt_id>/submit/', SubmitExamView.as_view(), name='submit-exam'),
    path('teacher/submissions/', TeacherSubmissionsListView.as_view(), name='teacher-submissions'),
    path('teacher/submissions/<int:attempt_id>/grade/', TeacherGradeAttemptView.as_view(), name='teacher-grade-attempt'),

    # --- NEU: Standard path() für Certification Paths ---
    # Verwendet .as_view({'get': 'list'}), um die GET-Anfrage auf die list-Methode des ViewSets zu mappen
    path(
        'certification-paths/',
        CertificationPathViewSet.as_view({'get': 'list'}),
        name='certification-path-list'
    ),
    # Optional: Wenn du auch eine Detailansicht bräuchtest (haben wir im Frontend aktuell nicht):
    # path(
    #     'certification-paths/<int:pk>/',
    #     CertificationPathViewSet.as_view({'get': 'retrieve'}),
    #     name='certification-path-detail'
    # ),

    # URLs, die vom Router generiert wurden, entfernt
    # path('', include(router.urls)), # Entfernt
]
