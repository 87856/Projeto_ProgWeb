// =====================================================================
//  api.ts — Cliente HTTP para o backend Strapi 5
//  ---------------------------------------------------------------------
//  - getStrapiUrl(): resolve o endereço do backend (sem o "/api" no fim).
//  - strapiFetch<T>(): fetch genérico com autenticação opcional.
//    Para métodos não-GET, o Strapi 5 devolve { data: ... } — o helper
//    desembrulha automaticamente.
//  - dronesApi, zonasApi: helpers de alto nível (list, get, create,
//    update, remove).
//
//  IMPORTANTE (Strapi 5):
//  - As respostas REST são FLAT (sem { data: { id, attributes } }).
//  - Para PUT / DELETE usa-se SEMPRE documentId, nunca o id numérico.
//  - Relações N-N enviam-se no formato connect/disconnect:
//      [{ documentId: "abc123" }, ...]
// =====================================================================

import type { Drone, ZonaVoo } from "./types";

const RAW_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export const getStrapiUrl = () =>
  RAW_URL.endsWith("/api") ? RAW_URL.slice(0, -4) : RAW_URL;

export const getStrapiApiUrl = () => `${getStrapiUrl()}/api`;

interface FetchOptions {
  jwt?: string;
  query?: string;
  body?: unknown;
  method?: "GET" | "POST" | "PUT" | "DELETE";
}

export async function strapiFetch<T = unknown>(
  path: string,
  { jwt, query = "", body, method = "GET" }: FetchOptions = {},
): Promise<T> {
  const separator = query.startsWith("?") || query.startsWith("&") ? "" : (query ? "?" : "");
  const url = `${getStrapiApiUrl()}${path}${separator}${query}`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: method === "GET" ? "no-store" : "default",
  });

  if (!res.ok) {
    let detalhe = res.statusText;
    try {
      const errBody = await res.json();
      detalhe = errBody?.error?.message || JSON.stringify(errBody);
    } catch { /* eslint-disable-next-line */ }
    throw new Error(`[Strapi] ${method} ${path} → ${res.status} ${detalhe}`);
  }

  if (res.status === 204) return undefined as unknown as T;

  const json = await res.json();

  // Strapi 5 envolve quase todas as respostas em { data, ... }:
  //   GET  /api/<tipo>          → { data: T[],   meta: {...} }
  //   GET  /api/<tipo>/:id      → { data: T,     meta: {...} }
  //   POST / PUT  /api/<tipo>   → { data: T }
  //   DELETE                     (204 → já tratado em cima)
  // Desembrulhamos sempre que exista um campo `data` para que os helpers
  // possam ser tipados directamente como Drone / ZonaVoo / User.
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

const POPULATE = "populate=*";

export const dronesApi = {
  list: (jwt?: string) =>
    strapiFetch<Drone[]>(`/drones`, {
      jwt,
      query: `${POPULATE}&pagination[pageSize]=100&sort=nome:asc`,
    }),
  get: (documentId: string, jwt?: string) =>
    strapiFetch<Drone>(`/drones/${documentId}`, { jwt, query: POPULATE }),
  create: (data: Omit<Drone, "id" | "documentId" | "createdAt" | "updatedAt" | "publishedAt">, jwt: string) =>
    strapiFetch<Drone>(`/drones`, { jwt, method: "POST", body: { data } }),
  update: (documentId: string, data: Partial<Drone>, jwt: string) =>
    strapiFetch<Drone>(`/drones/${documentId}`, { jwt, method: "PUT", body: { data } }),
  remove: (documentId: string, jwt: string) =>
    strapiFetch<void>(`/drones/${documentId}`, { jwt, method: "DELETE" }),
};

export const zonasApi = {
  list: (jwt?: string) =>
    strapiFetch<ZonaVoo[]>(`/zona-voos`, {
      jwt,
      query: `${POPULATE}&pagination[pageSize]=100&sort=nome:asc`,
    }),
  get: (documentId: string, jwt?: string) =>
    strapiFetch<ZonaVoo>(`/zona-voos/${documentId}`, { jwt, query: POPULATE }),
  create: (data: Omit<ZonaVoo, "id" | "documentId" | "createdAt" | "updatedAt" | "publishedAt">, jwt: string) =>
    strapiFetch<ZonaVoo>(`/zona-voos`, { jwt, method: "POST", body: { data } }),
  update: (documentId: string, data: Partial<ZonaVoo>, jwt: string) =>
    strapiFetch<ZonaVoo>(`/zona-voos/${documentId}`, { jwt, method: "PUT", body: { data } }),
  remove: (documentId: string, jwt: string) =>
    strapiFetch<void>(`/zona-voos/${documentId}`, { jwt, method: "DELETE" }),
};

export interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    blocked?: boolean;
    role?: { id: number; name: string; type: string; description?: string };
  };
}

export async function strapiLogin(identifier: string, password: string): Promise<AuthResponse> {
  return strapiFetch<AuthResponse>(`/auth/local`, {
    method: "POST",
    body: { identifier, password },
  });
}

export async function strapiRegister(
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return strapiFetch<AuthResponse>(`/auth/local/register`, {
    method: "POST",
    body: { username, email, password },
  });
}

export const formatEuro = (n?: number) =>
  n?.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }) ?? "—";

export const tipoZonaCor: Record<string, string> = {
  Permitida: "#22c55e",
  Restrita: "#f59e0b",
  Proibida: "#ef4444",
};

/**
 * Helper para construir um payload de relação M-N no formato
 * que o Strapi 5 espera: `[{ documentId: "abc" }, ...]` (documentos
 * próprios) ou `[{ id: 1 }]` (plugin users) consoante o alvo.
 */
export const connectedDocs = (ids: string[]) =>
  ids.map((documentId) => ({ documentId }));

export const connectedUsers = (ids: number[]) =>
  ids.map((id) => ({ id }));
