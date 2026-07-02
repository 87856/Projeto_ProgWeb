# DroneZone — Frontend (Next.js 15)

Aplicação Next.js 15 (App Router) com **React Bootstrap** e **NextAuth.js v5**.

URL local de desenvolvimento: **http://localhost:3000**

---

## 🚀 Arranque rápido

```bash
cd frontend
cp .env.example .env.local       # edita a chave Google Maps + AUTH_SECRET
npm install                       # aceita peerDeps legadas (legacy-peer-deps)
npm run dev                       # http://localhost:3000
```

---

## 🔐 Auth (NextAuth.js v5 + Strapi)

| Endpoint | Página |
|---|---|
| `/login` | formulário de login (Strapi Credentials provider) |
| `/register` | criação de conta via `POST /api/auth/local/register` |
| `/api/auth/*` | handlers do NextAuth |
| `middleware.ts` | protege `/admin/**` |

Sessão JWT do Strapi é guardada num cookie HttpOnly pelo NextAuth.
A função `auth()` permite ler a sessão em Server Components / Route Handlers.
`useSession()` permite lê-la em Client Components.

---

## 📂 Estrutura (App Router)

```
app/
├── api/auth/[...nextauth]/route.ts   ← handlers do NextAuth
├── page.tsx                          ← Início
├── catalogo/page.tsx                 ← Catálogo (SWR + Strapi)
├── comparacao/page.tsx               ← Tabela de comparação
├── sobre/page.tsx                    ← Página estática
├── contacto/page.tsx                 ← Formulário (React Hook Form)
├── mapa/page.tsx                     ← Mapa + Simulador
├── login/page.tsx                    ← Login
├── register/page.tsx                 ← Registo
└── admin/                            ← 🔒 rotas protegidas
    ├── page.tsx                      ← Dashboard
    ├── drones/ (list, novo, [documentId])
    └── zonas/  (list, novo, [documentId])

components/    NavBar, DroneCard, ConfirmModal, MapaSimulador
lib/           api.ts, auth.ts, types.ts
middleware.ts  Protecção RBAC
```

---

## 📜 Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm run lint` | Lint |
| `npm run typecheck` | Apenas compilação TS |

---




1. Definir as variáveis de ambiente em **Settings → Environment Variables**:
   - `NEXT_PUBLIC_STRAPI_URL` (URL da Strapi Cloud)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `AUTH_SECRET` (gerado em produção com `openssl rand -base64 32`)
   - `AUTH_TRUST_HOST=true`


---

## 🗺️ Mapa & Simulador

A página `/mapa` carrega o componente `MapaSimulador.tsx` com `next/dynamic` (SSR off).
O componente usa `@vis.gl/react-google-maps` e desenha cada zona como um
`google.maps.Circle` (criado via `useMap()`), mostrando:

- ✔ verde — zona permitida
- ⚠️ laranja — zona restrita + altitude máx
- 🚫 vermelho — zona proibida (alerta crítico)
- 📡 roxo — drone excedeu alcance máximo

A chave em `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` deve estar **restringida por domínio**
em [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
