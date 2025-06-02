import json
import sys
import io
import os
import unittest
import importlib.util
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings # Needed for BASE_DIR potentially, or relative path logic
from django.utils import timezone # timezone importieren
from ..models import Task, UserTaskProgress # UserTaskProgress importieren
from rest_framework.permissions import IsAuthenticated # Importieren
from rest_framework.views import APIView # Verwende APIView für DRF-Features
from ..util.security_exe import SecurityExecutor # Import der neuen Sicherheitsschicht

# Ersetze Django View mit DRF APIView und füge permission_classes hinzu
# @method_decorator(csrf_exempt, name='dispatch') # Nicht mehr nötig mit APIView und JWT Auth
class ExecutePythonCodeView(APIView): # Ändere Vererbung zu APIView
    permission_classes = [IsAuthenticated] # Füge Authentifizierung hinzu

    def post(self, request, *args, **kwargs):
        # Verwende request.data statt json.loads(request.body)
        try:
            data = request.data
        except Exception as e:
             # Sollte mit DRF eigentlich nicht mehr nötig sein, aber sicher ist sicher
             return JsonResponse({'error': f'Could not parse request data: {e}'}, status=400)

        code = data.get('code', '')
        task_id = data.get('task_id')

        if not code:
            return JsonResponse({'error': 'No code provided.'}, status=400)
        if task_id is None:
            # Fallback to simple execution if no task_id is provided (optional)
            # For now, let's require task_id for testing
            return JsonResponse({'error': 'No task_id provided.'}, status=400)

        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            return JsonResponse({'error': f'Task with id {task_id} not found.'}, status=404)
        except ValueError:
             return JsonResponse({'error': f'Invalid task_id format: {task_id}.'}, status=400)


        if not task.test_file_path:
            return JsonResponse({'error': f'Task {task_id} has no associated test file.'}, status=400)

        # Construct the full path to the test file (relative to modules app)
        # Assuming 'modules' app directory is settings.BASE_DIR / 'modules'
        # Or better: Calculate relative to this file's location if settings are not available easily
        # modules_app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # Path to modules app
        # For simplicity, let's assume BASE_DIR exists and 'modules' is directly under it.
        # A more robust solution might involve AppConfig.get_path('modules')
        try:
            # Simplified path construction - adjust if your structure differs
            base_path = os.path.join(settings.BASE_DIR, 'modules')
            test_file_full_path = os.path.abspath(os.path.join(base_path, task.test_file_path))

            if not os.path.isfile(test_file_full_path):
                 # Try relative to the models.py file's directory structure as fallback
                 models_dir = os.path.dirname(Task._meta.app_config.path) # Get 'modules' app path
                 test_file_full_path = os.path.abspath(os.path.join(models_dir, task.test_file_path))
                 if not os.path.isfile(test_file_full_path):
                      raise FileNotFoundError(f"Test file not found at derived paths for: {task.test_file_path}")

            # Dynamically load the test module
            spec = importlib.util.spec_from_file_location("task_test_module", test_file_full_path)
            if spec is None or spec.loader is None:
                 raise ImportError(f"Could not create module spec for {test_file_full_path}")
            test_module = importlib.util.module_from_spec(spec)
            # sys.modules["task_test_module"] = test_module # Register module? Maybe needed

        except FileNotFoundError as e:
             return JsonResponse({'error': str(e)}, status=400)
        except ImportError as e:
             return JsonResponse({'error': f"Error importing test module: {str(e)}"}, status=500)
        except Exception as e:
             # Catch other potential path or settings errors
             return JsonResponse({'error': f"Error setting up test environment: {str(e)}"}, status=500)

        # Sicherheits-Executor mit 10 Sekunden Timeout erstellen
        security_executor = SecurityExecutor(timeout=10)

        # Ersetzt die alte unsichere exec-Logik durch die sichere Ausführung
        execution_error = None
        test_results = None
        test_results_obj = None

        try:
            # 1. Führe den Code des Benutzers sicher aus
            # Dies ersetzt: exec(code, exec_globals, exec_locals)
            execution_result = security_executor.execute_secure(code)
            
            if not execution_result["success"]:
                # Keine doppelte Fehlermeldung - error und stderr werden zusammengefasst
                return JsonResponse({
                    'error': execution_result["error"],
                    'stdout': execution_result["stdout"],
                    'stderr': execution_result["stderr"],
                    'test_results': None,
                    'execution_error': None  # Kein execution_error, um Duplikate zu vermeiden
                })
            
            # Hole lokale Variablen aus der sicheren Ausführung
            exec_locals = execution_result["locals"]
            
            # Stelle sicher, dass wir die Ausgabe haben
            code_output = execution_result["stdout"]
            
            # 2. Prepare and run the unit tests
            # --- Inject executed code's locals into the test module's scope ---
            for key, value in exec_locals.items():
                setattr(test_module, key, value)
            # --- End injection ---

            # Redirect for test execution
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            redirected_output = io.StringIO()
            redirected_error = io.StringIO()
            sys.stdout = redirected_output
            sys.stderr = redirected_error
            
            try:
                # Now execute the test module. Tests should be able to find the user's definitions.
                spec.loader.exec_module(test_module)

                suite = unittest.TestSuite()
                loader = unittest.defaultTestLoader
                # Load all tests from the dynamically loaded module
                suite.addTest(loader.loadTestsFromModule(test_module))

                # Run tests and capture results
                # Use a buffer for TextTestRunner
                runner_buffer = io.StringIO()
                runner = unittest.TextTestRunner(stream=runner_buffer, verbosity=2) # Keep verbosity for detailed results object
                test_results_obj = runner.run(suite)

                # Format results (this still contains detailed error/failure info)
                test_results = {
                    "runs": test_results_obj.testsRun,
                    "success": test_results_obj.wasSuccessful(),
                    "errors": [(str(test), err) for test, err in test_results_obj.errors],
                    "failures": [(str(test), fail) for test, fail in test_results_obj.failures],
                }
            except Exception as e:
                # Test-Ausführungsfehler - wird in stderr angezeigt, keine doppelte Meldung
                test_error = f"Fehler bei der Test-Ausführung: {e}"
                redirected_error.write(test_error)
                execution_error = None  # Kein execution_error, um Duplikate zu vermeiden
            finally:
                sys.stdout = old_stdout
                sys.stderr = old_stderr

            # === NEU: Task als erledigt markieren bei Erfolg ===
            if test_results_obj and test_results_obj.wasSuccessful():
                user = request.user # Den aktuellen Benutzer holen
                progress, created = UserTaskProgress.objects.update_or_create(
                    user=user,
                    task=task,
                    defaults={
                        'completed': True,
                        'completed_at': timezone.now()
                    }
                )
                if created:
                    print(f"[Progress Tracker] Marked Task {task.id} as completed for User {user.id}.")
                else:
                     print(f"[Progress Tracker] Updated Task {task.id} status to completed for User {user.id}.")
            # ======================================================

        except Exception as e:
            # Allgemeiner Fehler - wird nur in stderr angezeigt, keine Duplizierung
            stderr_message = f"Fehler bei der Code-Ausführung: {e}"
            stderr = stderr_message if not 'stderr' in execution_result else execution_result['stderr'] + "\n" + stderr_message
            execution_error = None  # Kein execution_error, um Duplikate zu vermeiden
            return JsonResponse({
                'stdout': execution_result.get('stdout', ''),
                'stderr': stderr,
                'execution_error': None,  # Kein execution_error, um Duplikate zu vermeiden
                'test_results': None,
            })
            
        # Sammle alle Ausgaben
        test_output = redirected_output.getvalue()
        all_output = code_output
        if test_output and not test_output in all_output:
            if all_output:
                all_output += "\n" + test_output
            else:
                all_output = test_output
                
        stderr = execution_result["stderr"] + redirected_error.getvalue() if "stderr" in execution_result else redirected_error.getvalue()

        # Zeige die Benutzerausgabe immer an, wenn vorhanden
        if all_output.strip():
            response_data = {
                'stdout': all_output,
                'stderr': stderr,  # Enthält alle Fehlermeldungen
                'execution_error': None,  # Kein execution_error, um Duplikate zu vermeiden
                'test_results': test_results,
            }
        else:
            # Leere Ausgabe
            response_data = {
                'stdout': "",
                'stderr': stderr,  # Enthält alle Fehlermeldungen
                'execution_error': None,  # Kein execution_error, um Duplikate zu vermeiden
                'test_results': test_results,
            }

        return JsonResponse(response_data)
    
    def get(self, request, *args, **kwargs):
        return HttpResponse("Only POST requests are allowed.", status=405)
