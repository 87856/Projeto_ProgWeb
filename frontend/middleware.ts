// =====================================================================
//  middleware.ts — Protecção das rotas /admin/*
//  ---------------------------------------------------------------------
//  Bloqueia utilizadores sem sessão iniciada. Quem tentar entrar em
//  /admin/drones ou /admin/zonas é redireccionado para /login.
//
//  Os assets internos do Next.js são ignorados para não ocorrerem
//  loops de autenticação.
// =====================================================================

import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLogged = !!req.auth;

  if (pathname.startsWith("/admin") && !isLogged) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }
  return;
});

export const config = {
  // Protege tudo o que é página, excepto API/auth/assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)).*)"],
};
