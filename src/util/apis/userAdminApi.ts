import api from "./api";

/**
 * Admin-User-API für CRUD-Operationen
 * Nur für Staff und Admin-Benutzer zugänglich
 */

interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined?: string;
  last_login?: string;
  groups?: number[];
}

interface NameAbbreviation {
  id: number;
  username: string;
  email: string;
  name_abbreviation: string;
}

// Basis-URL für die User-Admin-API
const BASE_URL = "/users/admin/users";

/**
 * Holt eine Liste aller Benutzer
 * @returns Promise mit der Liste aller Benutzer
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get(`${BASE_URL}/`);
  return response.data;
};

/**
 * Holt eine Liste aller Benutzer mit vereinfachten Daten (nur ID, Username, Email, Name-Kürzel)
 * @returns Promise mit der vereinfachten Liste aller Benutzer
 */
export const getSimplifiedUserList = async (): Promise<NameAbbreviation[]> => {
  const response = await api.get(`${BASE_URL}/simplified_list/`);
  return response.data;
};

/**
 * Holt die Details eines einzelnen Benutzers
 * @param userId ID des Benutzers
 * @returns Promise mit den Benutzerdetails
 */
export const getUserById = async (userId: number): Promise<User> => {
  const response = await api.get(`${BASE_URL}/${userId}/`);
  return response.data;
};

/**
 * Erstellt einen neuen Benutzer
 * @param userData Benutzerdaten für den neuen Benutzer
 * @returns Promise mit dem erstellten Benutzer
 */
export const createUser = async (userData: User): Promise<User> => {
  const response = await api.post(`${BASE_URL}/`, userData);
  return response.data;
};

/**
 * Aktualisiert einen bestehenden Benutzer
 * @param userId ID des Benutzers
 * @param userData Aktualisierte Benutzerdaten
 * @returns Promise mit dem aktualisierten Benutzer
 */
export const updateUser = async (
  userId: number,
  userData: Partial<User>,
): Promise<User> => {
  const response = await api.put(`${BASE_URL}/${userId}/`, userData);
  return response.data;
};

/**
 * Löscht einen Benutzer
 * @param userId ID des zu löschenden Benutzers
 * @returns Promise mit der Antwort
 */
export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${userId}/`);
};

/**
 * Holt nur Staff-Benutzer
 * @returns Promise mit der Liste der Staff-Benutzer
 */
export const getStaffUsers = async (): Promise<User[]> => {
  const response = await api.get(`${BASE_URL}/staff_users/`);
  return response.data;
};

/**
 * Holt nur Admin-Benutzer
 * @returns Promise mit der Liste der Admin-Benutzer
 */
export const getAdminUsers = async (): Promise<User[]> => {
  const response = await api.get(`${BASE_URL}/admin_users/`);
  return response.data;
};

/**
 * Setzt den Staff-Status eines Benutzers
 * @param userId ID des Benutzers
 * @param isStaff Neuer Staff-Status
 * @returns Promise mit dem aktualisierten Benutzer
 */
export const setUserStaffStatus = async (
  userId: number,
  isStaff: boolean,
): Promise<User> => {
  const response = await api.post(`${BASE_URL}/${userId}/set_staff_status/`, {
    is_staff: isStaff,
  });
  return response.data;
};

/**
 * Setzt den Aktivierungsstatus eines Benutzers
 * @param userId ID des Benutzers
 * @param isActive Neuer Aktivierungsstatus
 * @returns Promise mit dem aktualisierten Benutzer
 */
export const setUserActiveStatus = async (
  userId: number,
  isActive: boolean,
): Promise<User> => {
  const response = await api.post(`${BASE_URL}/${userId}/set_active_status/`, {
    is_active: isActive,
  });
  return response.data;
};

// --- Initiales Passwort Setzen (Nach erstem Login) --- //

interface InitialPasswordSetData {
  new_password: string;
  new_password_confirm: string;
}

/**
 * Sendet das neue Passwort nach dem ersten Login.
 * Erfordert Authentifizierung (Token muss gesendet werden).
 * @param passwordData Objekt mit new_password und new_password_confirm
 * @returns Promise mit der Erfolgs- oder Fehlermeldung
 */
export const setInitialPassword = async (
  passwordData: InitialPasswordSetData,
): Promise<{ message?: string; error?: string }> => {
  // api-Instanz sollte den Auth-Token automatisch mitsenden
  const response = await api.post(`/users/set-initial-password/`, passwordData);
  return response.data;
};
