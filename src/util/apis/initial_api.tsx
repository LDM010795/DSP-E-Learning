// apiFetch.ts

/** 
 * ? Example:
// GET: Fetch a list of users with optional query parameters (e.g. limit & offset)
api.get<User[]>('/users', { query: { limit: 10, offset: 0 } })
  .then(users => console.log('Fetched users:', users))
  .catch(error => console.error('Error fetching users:', error));

// POST: Create a new user by sending JSON data in the request body
api.post<User>('/users', { name: 'John Doe', email: 'john@example.com' })
  .then(newUser => console.log('Created user:', newUser))
  .catch(error => console.error('Error creating user:', error));

// PUT: Update an existing user (e.g. user with id 123) with new data
api.put<User>('/users/123', { name: 'John Smith', email: 'john.smith@example.com' })
  .then(updatedUser => console.log('Updated user:', updatedUser))
  .catch(error => console.error('Error updating user:', error));

// DELETE: Delete a user (e.g. user with id 123)
api.delete<{ message: string }>('/users/123')
  .then(response => console.log('Delete response:', response))
  .catch(error => console.error('Error deleting user:', error));

 */

// Define base URL (e.g. "https://example.com/api")
const BASE_URL = `${import.meta.env.VITE_API_URL}`;

// Extend fetch options with an optional 'query' property for URL query parameters.
interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean>;
}

/**
 * Generic request function.
 * - Adds JSON Content-Type and Authorization header (if token exists).
 * - Appends query parameters to the URL.
 * - Parses JSON response.
 *
 * @param endpoint - API endpoint (e.g. "/users")
 * @param options - Additional fetch options and optional query object.
 * @returns Parsed JSON response of type T.
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = localStorage.getItem("authToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Build full URL, appending query parameters if provided.
  let url = BASE_URL + endpoint;
  console.log("url:", url);
  if (options.query) {
    const params = new URLSearchParams();
    Object.entries(options.query).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    url += `?${params.toString()}`;
  }

  // Remove 'query' property from options before passing to fetch
  const { query: _, ...init } = options;

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.status === 204 ? (null as unknown as T) : response.json();
}

/**
 * API helper methods for common HTTP operations.
 * Usage examples:
 *   api.get<User[]>("/users", { query: { limit: 10 } });
 *   api.post("/users", newUserData);
 */
export const api = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },
  post<T>(
    endpoint: string,
    data: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  put<T>(
    endpoint: string,
    data: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
