# DroneZone — Backend (Strapi)

API REST do projecto **DroneZone**, escrita em **Strapi 5**.

Endpoint principal (desenvolvimento): **http://localhost:1337**

---

## 🚀 Arranque rápido

```bash
cd backend
npm install
cp .env.example .env       # editar se necessário
npm run develop            # abre em http://localhost:1337/admin
```

Na primeira execução o **Strapi** cria automaticamente:

| Recurso | Origem | Conteúdo |
|---|---|---|
| 6 Drones | `src/index.js` → `dronesSeed` | os mesmos modelos do catálogo |
| 6 Zonas de voo | `src/index.js` → `zonasSeed` | zonas Permitidas/Restritas/Proibidas em Portugal |
| Papel `public` | RBAC | `find` + `findOne` em drones e zonas |
| Papel `authenticated` | RBAC | CRUD completo em drones e zonas |
| Documentação OpenAPI | `@strapi/plugin-docs` | `GET /api/docs` e `/api/docs.json` |

Para criar o **administrador do painel Strapi** abrir `/admin` no primeiro arranque.

---

## 📚 Documentação da API (Swagger / OpenAPI)

| URL | O que mostra |
|---|---|
| `/api/docs` | Swagger UI navegável |
| `/api/docs.json` | Especificação OpenAPI 3 em JSON |

Todas as rotas REST geradas pelos modelos `Drone` e `Zona de Voo`, assim como as rotas de autenticação (`/api/auth/local`), aparecem automaticamente.

---

## 🔐 Modelo de roles (RBAC)

O projecto tem **2 papéis principais** configurados em `src/index.js`:

| Papel | Tipo de utilizador | Permissões |
|---|---|---|
| **Public** | Visitante anónimo (sem login) | `find` + `findOne` em drones e zonas |
| **Authenticated** | Utilizador autenticado (login feito) | `find` + `findOne` + `create` + `update` + `delete` em drones e zonas |

> 💡 Diferença prática: o visitante pode **ver** o catálogo e o mapa.
> O utilizador autenticado pode adicionalmente **criar/editar/apagar**
> drones e zonas a partir das páginas `/admin/drones` e `/admin/zonas`.

---

## 🧱 Estrutura dos modelos

### Drone (`/api/drones`)

| Campo | Tipo | Notas |
|---|---|---|
| `nome` | string | obrigatório |
| `categoria` | string | Fotografia, Profissional, … |
| `preco` | integer | euros |
| `autonomia` | integer | minutos |
| `alcance` | integer | km |
| `velocidade` | integer | km/h |
| `peso` | integer | gramas |
| `camara` | string | ex. "4K / 48MP" |
| `imagem` | string | caminho do ficheiro (em `/public`) |
| `descricao` | text | descrição longa |
| `users_permissions_user` | relation manyToOne → User | dono do drone (relação **1-N**) |
| `zona_de_voos` | relation manyToMany → Zona de Voo | zonas onde pode voar (relação **N-N**) |

### Zona de Voo (`/api/zona-voos`)

| Campo | Tipo | Notas |
|---|---|---|
| `nome` | string | obrigatório |
| `tipo` | enum | `Permitida` · `Restrita` · `Proibida` |
| `latitude` | decimal | graus |
| `longitude` | decimal | graus |
| `raio` | integer | metros (default 1000) |
| `altitudeMax` | integer | metros |
| `descricao` | text | descrição longa |
| `users_permissions_users` | relation manyToMany → User | pilotos com acesso (relação **N-N**) |
| `drones` | relation manyToMany → Drone | drones compatíveis (relação **N-N**, mapeada por `zona_de_voos`) |

### User (extensão)

Herda do plugin `users-permissions`, com duas relações extra:

- `drones` (oneToMany) — relação **1-N**: um utilizador pode ter muitos drones
- `zona_de_voos` (manyToMany) — relação **N-N**: um utilizador pode estar ligado a várias zonas

---

## ☁️ Deploy — Strapi Cloud

1. Subir o código a um repositório Git (GitHub, GitLab, …).
2. Em [cloud.strapi.io](https://cloud.strapi.io), criar um projecto Strapi Cloud
   apontando para o repositório.
3. Definir as variáveis de ambiente (`.env`) na plataforma:
   - `APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`
   - `DATABASE_URL` (Postgres), `DATABASE_SSL=true`
4. O `Dockerfile` fornecido entra em acção automaticamente.

### Tipos de variáveis do `.env`

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=…       # npx strapi generate
ADMIN_JWT_SECRET=…
API_TOKEN_SALT=…
TRANSFER_TOKEN_SALT=…
ENCRYPTION_KEY=…
DATABASE_URL=…   # em produção (Postgres)
DATABASE_CLIENT=postgres   # ou sqlite em desenvolvimento
```

---

## 📂 Estrutura relevante

```
backend/
├── config/              ← plugins.js (Swagger), middlewares.js, …
├── src/
│   ├── api/
│   │   ├── drone/       ← Drone schema + controller + service + routes
│   │   └── zona-voo/    ← Zona de Voo schema + controller + …
│   ├── extensions/
│   │   └── users-permissions/content-types/user/   ← schema do User (estendido)
│   └── index.js         ← Bootstrap (seed + RBAC + Swagger)
├── Dockerfile           ← Build para Strapi Cloud
└── package.json
```

---

## 🧪 Testar via cURL

```bash
# Login de um utilizador autenticado
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@drone.zone","password":"senha123"}'

# Listar drones (precisa de JWT no header Authorization: Bearer …)
curl http://localhost:1337/api/drones?populate=* \
  -H "Authorization: Bearer <jwt>"

# Listar drones como visitante (só funciona graças à permissão pública)
curl http://localhost:1337/api/drones
```
