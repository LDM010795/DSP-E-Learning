from django.urls import path
from . import views # Korrigierter relativer Import



# Define app_name if you plan to use URL reversing with namespaces
# app_name = 'modules'

urlpatterns = [
    # Public/Admin Module Views (no user context)
    path('public/', views.ModuleListViewPublic.as_view(), name='module-list-public'),
    path('public/<int:pk>/', views.ModuleDetailViewPublic.as_view(), name='module-detail-public'),

    # User-Specific Module Views
    path('user/', views.UserModuleListView.as_view(), name='user-module-list'),
    path('user/<int:pk>/', views.UserModuleDetailView.as_view(), name='user-module-detail'),

    # Code Execution View
    path('execute/', views.ExecutePythonCodeView.as_view(), name='execute-python-code'),
]
