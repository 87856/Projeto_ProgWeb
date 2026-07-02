// =====================================================================
//  auth.ts — Configuração NextAuth.js v5 (Auth.js v5)
//  ---------------------------------------------------------------------
//  Provider Credentials → Strapi POST /api/auth/local.
//  Devolve handlers (re-exportado em app/api/auth/[...nextauth]/route.ts)
//  e helpers signIn/signOut/auth usados noutros pontos da app.
// =====================================================================

import NextAuth, { type DefaultSession, type User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { strapiLogin, type AuthResponse } from "./api";
import type { SessionUser } from "./types";

/**
 * Gera um segredo aleatório em runtime sem importar `node:crypto` (que
 * quebra o bundling do webpack para o runtime Edge onde o middleware
 * corre). Usa a Web Crypto API, que existe como global em Node 19+ e em
 * todos os browsers/runners Edge modernos.
 *
 * Lançamos um erro se o Web Crypto não existir (run-time absurdamente
 * antigo) — em vez de cairmos em Math.random() que daria uma chave
 * adivinhável.
 */
function devSecretFallback(): string {
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    throw new Error(
      "Web Crypto API indisponível neste runtime. Não é possível gerar " +
      "um AUTH_SECRET alternativo. Actualiza o Node (>= 19) ou define " +
      "AUTH_SECRET explicitamente.",
    );
  }
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Estender tipos do NextAuth para incluir os nossos campos ───
declare module "next-auth" {
  interface User {
    username?: string;
    role?: string;
    jwt?: string;
    numericId?: number;
  }
  interface Session {
    user: SessionUser & DefaultSession["user"];
  }
}

// ── Resolução do AUTH_SECRET (sem throw para não quebrar o build) ──
// Atenção: NÃO fazemos `throw` aqui. O `next build` corre com
// NODE_ENV=production E tipicamente sem .env.local definido, o que
// mataria a build caso lançássemos um erro. Em vez disso:
//   • dev/build sem AUTH_SECRET → fallback aleatório + aviso amarelo
//   • produção sem AUTH_SECRET  → fallback aleatório + aviso vermelho
//                                  sessions são invalidadas em cada
//                                  reinício, sinal claro para o operator.
// Para segredo fixo e estável usa `npx auth secret` e mete-o em
// `.env.local` (dev) ou Environment Variables da Vercel (prod).
if (!process.env.AUTH_SECRET && !(globalThis as any).__AUTH_WARNED__) {
  const isProd = process.env.NODE_ENV === "production";
  // eslint-disable-next-line no-console
  console.warn(
    isProd
      ? "\n🔥 AUTH_SECRET não definido em PRODUÇÃO! A usar fallback aleatório; " +
        "as sessões serão invalidadas a cada reinício. Define-o com " +
        "`npx auth secret` ou `openssl rand -base64 32`.\n"
      : "\n⚠️  AUTH_SECRET não definido em .env.local. A usar fallback aleatório " +
        "(reiniciar o servidor invalida as sessões). Para dev estável mete-o em " +
        ".env.local com `npx auth secret`.\n",
  );
  (globalThis as any).__AUTH_WARNED__ = true;
}

// Cache do fallback em globalThis para sobreviver ao HMR do Next.js.
// Sem isto, qualquer save num ficheiro em /app regenera o segredo e
// desloga o utilizador a meio da sessão durante o desenvolvimento.
const SECRET: string =
  process.env.AUTH_SECRET ??
  (globalThis as any).__AUTH_DEV_SECRET__ ??
  ((globalThis as any).__AUTH_DEV_SECRET__ = devSecretFallback());

// Confiar no host indicado pelo header X-Forwarded-Host quando se está
// atrás de um proxy (Vercel, Strapi Cloud). Em dev aceita localhost.
const trustHost =
  process.env.AUTH_TRUST_HOST === "true" ||
  process.env.NODE_ENV !== "production";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: SECRET,
  trustHost,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Strapi",
      credentials: {
        identifier: { label: "Utilizador ou email", type: "text" },
        password: { label: "Palavra-passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        try {
          const res: AuthResponse = await strapiLogin(
            String(credentials.identifier),
            String(credentials.password),
          );

          const u: NextAuthUser = {
            id: String(res.user.id),
            name: res.user.username,
            email: res.user.email,
            username: res.user.username,
            role: res.user.role?.type || "authenticated",
            jwt: res.jwt,
            numericId: res.user.id,
          };
          return u;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as NextAuthUser & {
          username?: string;
          role?: string;
          jwt?: string;
          numericId?: number;
        };
        token.jwt = u.jwt ?? "";
        token.role = u.role ?? "authenticated";
        token.username = u.username ?? "";
        token.numericId = u.numericId ?? parseInt(String(u.id ?? "0"), 10);
      }
      return token;
    },
    async session({ session, token }) {
      const s = session.user as unknown as SessionUser;
      s.id = String(token.sub ?? (token.numericId as number) ?? "");
      s.numericId = (token.numericId as number) ?? undefined;
      s.username = (token.username as string) ?? "";
      s.role = (token.role as string) ?? "authenticated";
      s.jwt = (token.jwt as string) ?? "";
      return session;
    },
  },
});
