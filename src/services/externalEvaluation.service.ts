import { BASE_URL } from "@/constants/global.constant";
import type {
  AccessLinkRespondPayload,
  IAccessLinkReport,
  IAccessLinkSubmitPayload,
  IAccessLinkSubmitResult,
} from "@/types/externalEvaluation.type";

/**
 * External coach evaluation API (emailed access link).
 *
 * Deliberately NOT built on `apiSlice`: the token in the URL is the only
 * credential, so no Authorization header is sent, and a 401/403 here must not
 * trigger apiSlice's "clear session + redirect home" behaviour for whoever is
 * logged in on this browser.
 */

export class AccessLinkError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AccessLinkError";
  }
}

const base = (token: string) => `${BASE_URL}/players/game-report/access-link/${encodeURIComponent(token)}`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } catch {
    throw new AccessLinkError(0, "Network error. Please check your connection and try again.");
  }

  let body: { data?: T; message?: string } | null = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    throw new AccessLinkError(res.status, body?.message || `Request failed (${res.status})`);
  }
  return (body?.data ?? (body as unknown)) as T;
}

export const getAccessLinkReport = (token: string) => request<IAccessLinkReport>(base(token));

export const respondToAccessLink = (token: string, payload: AccessLinkRespondPayload) =>
  request<unknown>(`${base(token)}/respond`, { method: "POST", body: JSON.stringify(payload) });

export const submitAccessLinkEvaluation = (token: string, payload: IAccessLinkSubmitPayload) =>
  request<IAccessLinkSubmitResult>(`${base(token)}/submit`, { method: "PATCH", body: JSON.stringify(payload) });
