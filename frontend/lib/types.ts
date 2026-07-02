// =====================================================================
//  types.ts — Tipos partilhados entre páginas e componentes
//  ---------------------------------------------------------------------
//  Strapi 5 devolve respostas REST FLAT (sem { data: { attributes } })
//  e usa documentId (string) para mutações. Estes tipos seguem isso.
// =====================================================================

// ── Utilitários ─────────────────────────────────────────────────────
export interface StrapiDocument {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

// ── Drone ───────────────────────────────────────────────────────────
export interface Drone extends StrapiDocument {
  nome: string;
  categoria?: string;
  preco?: number;
  autonomia?: number;
  alcance?: number;
  velocidade?: number;
  peso?: number;
  camara?: string;
  imagem?: string;
  descricao?: string;

  /** Relação 1-N → User (dono do drone) */
  users_permissions_user?: User | null;
  /** Relação N-N → Zona de Voo */
  zona_de_voos?: ZonaVoo[];
}

// ── Zona de Voo ─────────────────────────────────────────────────────
export type TipoZona = "Permitida" | "Restrita" | "Proibida";

export interface ZonaVoo extends StrapiDocument {
  nome: string;
  tipo: TipoZona;
  latitude: number;
  longitude: number;
  raio?: number;
  altitudeMax?: number;
  descricao?: string;

  /** Relação N-N → User (pilotos com acesso) */
  users_permissions_users?: User[];
  /** Relação N-N → Drone (drones compatíveis) */
  drones?: Drone[];
}

// ── Utilizador (extensão do users-permissions) ──────────────────────
export interface User extends StrapiDocument {
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: { id: number; name: string; type: string };

  /** 1-N: um utilizador pode ter vários drones */
  drones?: Drone[];
  /** N-N: várias zonas por utilizador */
  zona_de_voos?: ZonaVoo[];
}

// ── Estado de sessão do NextAuth ─────────────────────────────────────
// (id em string — convenção do NextAuth.js v5)
export interface SessionUser {
  id: string;
  /** id numérico do Strapi (preservado para selects/checkboxes) */
  numericId?: number;
  documentId?: string;
  username: string;
  email: string;
  role: "public" | "authenticated" | string;
  jwt: string;
}
