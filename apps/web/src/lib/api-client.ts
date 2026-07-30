import { firebaseAuthClient } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

/**
 * Every authenticated request attaches the current Firebase ID token.
 * Server components and client components both funnel through here so
 * there is exactly one place that knows how to talk to the API.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const user = firebaseAuthClient.currentUser;
  const token = user ? await user.getIdToken() : null;

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? "Request failed", json?.details);
  }

  return json as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
