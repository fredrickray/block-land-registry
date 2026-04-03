import type { UserRole } from "@/contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://localhost:4444";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as
    | T
    | { error?: { message?: string } };
  if (!res.ok) {
    const msg =
      "error" in body && body.error?.message
        ? body.error.message
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

export async function registerAuth(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginAuth(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function meAuth(token: string): Promise<{ user: AuthUser }> {
  return authFetch<{ user: AuthUser }>("/api/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

