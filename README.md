# 🚁 DroneZone — Projecto Completo

Site sobre drones construído como trabalho prático da cadeira de
**Tecnologias da Internet**. Inclui:

- **Frontend** em **Next.js 15** + **React Bootstrap** (autenticação via NextAuth.js v5)
- **Backend** em **Strapi 5** com 2 content types e relações 1-N + N-N
- **Documentação Swagger/OpenAPI** em `/api/docs`
- **Roles RBAC**: `public` (restrito) e `authenticated` (com mais acesso)
- **CRUD completo** em todas as tabelas a partir do Next.js
- **Mapa Google Maps** com simulador de voo em tempo real
- **Deploy**: Vercel (frontend) + Strapi Cloud (backend)

> O antigo `site/` em HTML/CSS/JS foi **substituído** por `frontend/`.

---

## 📂 Estrutura do repositório

```
Site_sobre_Drones/
├── backend/               ← Strapi 5 (API + Swagger + RBAC + seed)
├── frontend/              ← Next.js 15 (UI + Auth + CRUD + Mapa)
├── README.md              ← este ficheiro
└── .idea/                 ← configs IntelliJ (IDE pessoal)
```

---

## 🏗️ Arquitectura

```
┌──────────────────────┐         ┌──────────────────────┐
│   Next.js (Vercel)   │  HTTPS  │   Strapi 5 (Cloud)   │
│                      │  ─────► │                      │
│ • React Bootstrap    │         │ • Drone (CRUD)       │
│ • NextAuth.js v5     │  JWT    │ • Zona de Voo (CRUD) │
│ • SWR + RHF          │  ◄───── │ • RBAC 2 papéis      │
│ • Google Maps sim.   │         │ • Swagger /api/docs  │
└──────────────────────┘         └──────────────────────┘
```

### Roles (RBAC)

| Papel | Permissões em `/api/drones` e `/api/zona-voos` |
|---|---|
| `public` (visitante) | apenas `find` + `findOne` |
| `authenticated` (login feito) | `find`, `findOne`, `create`, `update`, `delete` |

As permissões são **inseridas automaticamente** pelo `bootstrap` em
`backend/src/index.js` na primeira execução do Strapi.

### Relações

| De | Tipo | Para |
|---|---|---|
| `users_permissions_user ← drone` | **1-N** | um utilizador tem muitos drones |
| `user ↔ zona_de_voos` | **N-N** | utilizadores com acesso a várias zonas |
| `drone ↔ zona_de_voos` | **N-N** | drones compatíveis com várias zonas |

A página `/admin/zonas` permite editar todas estas relações
directamente (multi-select de drones e pilotos).

---

## 🔑 Chaves de API

Antes de correr o frontend em desenvolvimento, **tens de pôr chave(s) em
`frontend/.env.local`** (faz `cp frontend/.env.example frontend/.env.local`).

| Chave | Onde vai | Onde é lida | O que acontece se faltar |
|---|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `frontend/.env.local` | `components/MapaSimulador.tsx` | `/mapa` mostra um aviso em vez do mapa (nada quebra) |
| `NEXT_PUBLIC_STRAPI_URL`         | `frontend/.env.local` | `lib/api.ts`               | Lista de drones/zonas vazia |
| `AUTH_SECRET`                    | `frontend/.env.local` | `lib/auth.ts` (NextAuth v5) | `/api/auth/session` falha → erro 500 no Login |

Mais detalhes, incluindo como obter a chave do Google Maps em
[Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
e a chave do Strapi, estão em
[**`frontend/CHAVES_API.md`**](frontend/CHAVES_API.md).

> Em dev podes deixar o `AUTH_SECRET` em branco — a app gera um segredo
> aleatório no arranque e mostra um aviso amarelo. **Em produção é
> obrigatório.**

---

## 🚀 Arranque em desenvolvimento

### 1) Backend (Strapi)

```bash
cd backend
npm install
npm run develop          # http://localhost:1337
# abrir /admin e criar a primeira conta de administrador do Strapi
```

Quando o Strapi arranca pela primeira vez:

1. Carrega o seed (6 drones + 6 zonas).
2. Atribui permissões RBAC aos dois papéis.

Documentação Swagger: http://localhost:1337/api/docs

### 2) Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```

Abre `/admin` → redireciona para `/login`. Cria uma conta em `/register`
e ficarás automaticamente com o papel `authenticated` (CRUD completo).

---

## ✅ Relação com os requisitos

| Requisito | Onde |
|---|---|
| Frontend em Next.js | `frontend/app/**` |
| React Bootstrap | `frontend/app/layout.tsx`, todos os componentes |
| Strapi backend | `backend/` |
| Swagger/OpenAPI | `backend/config/plugins.js` → `GET /api/docs` |
| Login obrigatório | `frontend/middleware.ts` protege `/admin/**` |
| Registo (bônus) | `frontend/app/register/page.tsx` |
| 2 papéis: restrito + mais acesso | `backend/src/index.js` `bootstrap` |
| CRUD em todas as tabelas | `frontend/app/admin/{drones,zonas}/**` |
| Relações 1-N + N-N | Editáveis no formulário de zonas (multi-select) |
| Deploy Vercel | `frontend/vercel.json` + `README.md` |
| Deploy Strapi Cloud | `backend/Dockerfile` + `backend/README.md` |

---

## 🧪 Testes da API

### Login

```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"USERNAME","password":"PASSWORD"}'
```

### Listar drones (com JWT)

```bash
curl http://localhost:1337/api/drones?populate=* \
  -H "Authorization: Bearer <JWT>"
```

### Listar zonas (sem JWT, permissão pública)

```bash
curl http://localhost:1337/api/zona-voos?populate=*
```

Mais detalhes em [`backend/README.md`](backend/README.md) e
[`frontend/README.md`](frontend/README.md).
