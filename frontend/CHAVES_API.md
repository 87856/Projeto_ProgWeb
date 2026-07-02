# 🔑 Chaves de API — Onde colocar cada uma

Este guia mostra exactamente **onde** tens de pôr cada chave e como obtê-la.

---

## 1) Google Maps (para o mapa em `/mapa`)

| Onde | `frontend/.env.local` |
|---|---|
| Variável | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| Onde é lida | `frontend/components/MapaSimulador.tsx` |

Como obter:

1. Vai a https://console.cloud.google.com/google/maps-apis/credentials
2. Cria um **API key** novo.
3. **Restringe** a chave (importante!):
   - *Application restriction* → **HTTP referrers (websites)**
   - *Website restrictions*:
     - `http://localhost:3000/*`
     - `https://*.vercel.app/*` (ou o teu domínio de produção)
   - *API restrictions* → só **Maps JavaScript API**
4. Copia o valor (começa por `AIza…`) e cola em `frontend/.env.local` na linha `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=`.
5. Reinicia o `npm run dev`.

---

## 2) NextAuth (cookies de sessão)

| Onde | `frontend/.env.local` |
|---|---|
| Variável | `AUTH_SECRET` |
| Onde é lida | `frontend/lib/auth.ts` |

Como gerar:

```bash
openssl rand -base64 32      # ou: npx auth secret
```

Em **desenvolvimento local** podes deixá-la vazia; a app gera um fallback
(imprime um warning amarelo). Em produção usa SEMPRE um valor único e
guarda-o com segurança (não comitar no repositório).

---

## 3) Backend Strapi (a outra ponta da API)

A partir do momento em que fizeres login via o formulário, o frontend
vai falar com o Strapi em:

| Onde | `backend/.env` |
|---|---|
| `DATABASE_CLIENT`   | `sqlite` em dev, `postgres` em produção |
| `DATABASE_URL`      | (Postgres — só produção) |
| `APP_KEYS`          | gerado com `npx strapi generate` |
| `ADMIN_JWT_SECRET`  | gerado com `npx strapi generate` |
| `API_TOKEN_SALT`    | gerado com `npx strapi generate` |
| `TRANSFER_TOKEN_SALT` | gerado com `npx strapi generate` |
| `ENCRYPTION_KEY`    | gerado com `npx strapi generate` |

Mais detalhes em [`backend/README.md`](../backend/README.md).
