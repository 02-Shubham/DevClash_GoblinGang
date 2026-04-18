/**
 * lib/api.ts
 * ----------
 * Typed API client that automatically attaches the Firebase ID token
 * to every request. All backend calls go through this module.
 */

import { getAuth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Authenticated fetch wrapper.
 * Automatically attaches `Authorization: Bearer <idToken>` header.
 */
async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const user = getAuth().currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ----------------------------------------------------------------
// Auth
// ----------------------------------------------------------------
export const authApi = {
  register: () => apiFetch("/api/auth/register", { method: "POST" }),
  linkWallet: (walletAddress: string) =>
    apiFetch("/api/auth/link-wallet", {
      method: "POST",
      body: JSON.stringify({ walletAddress }),
    }),
  getProfile: () => apiFetch("/api/auth/profile"),
};

// ----------------------------------------------------------------
// Chat
// ----------------------------------------------------------------
export const chatApi = {
  send: (message: string, chatHistory: Array<{ role: string; content: string }> = []) =>
    apiFetch<{ response: string; transactionData: unknown | null }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, chatHistory }),
    }),
  getHistory: (limit = 20) =>
    apiFetch<{ messages: Array<Record<string, unknown>> }>(`/api/chat/history?limit=${limit}`),
};

// ----------------------------------------------------------------
// Agents
// ----------------------------------------------------------------
export const agentApi = {
  create: (data: { name: string; intent: string; wallet: string; permissions: { maxSpend: number } }) =>
    apiFetch<{ success: boolean; agent: any }>("/api/agent/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  list: () =>
    apiFetch<{ agents: Array<Record<string, unknown>> }>("/api/agent"),
  toggle: (agentId: string, status: "active" | "paused") =>
    apiFetch(`/api/agent/${agentId}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  delete: (agentId: string) =>
    apiFetch(`/api/agent/${agentId}`, { method: "DELETE" }),
};

// ----------------------------------------------------------------
// Logs
// ----------------------------------------------------------------
export const logApi = {
  getAll: (limit = 20) =>
    apiFetch<{ logs: Array<Record<string, unknown>> }>(`/api/logs?limit=${limit}`),
  getPending: () =>
    apiFetch<{ pendingTransactions: Array<Record<string, unknown>> }>("/api/logs/pending"),
  confirm: (logId: string, txHash: string) =>
    apiFetch(`/api/logs/${logId}/confirm`, {
      method: "PATCH",
      body: JSON.stringify({ txHash }),
    }),
  reject: (logId: string) =>
    apiFetch(`/api/logs/${logId}/reject`, { method: "PATCH" }),
};
