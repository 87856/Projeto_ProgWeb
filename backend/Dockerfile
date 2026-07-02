# =====================================================================
#  Dockerfile — Strapi Cloud / produção genérica
# =====================================================================
FROM node:20-alpine AS builder

WORKDIR /srv/app

# Ferramentas para compilar módulos nativos
RUN apk add --no-cache python3 make g++ openssl

# Copiar package.json + lock
COPY package*.json ./

# 1) Instalar TUDO (incluindo devDeps — necessários para o `npm run build`)
RUN npm install

# 2) Copiar o resto do código e construir o painel admin
COPY . .
RUN npm run build

# ---- 2ª etapa: imagem final apenas com dependências de produção ----
FROM node:20-alpine

WORKDIR /srv/app

RUN apk add --no-cache python3 make g++ openssl

# Copiar artefactos de build + node_modules da etapa anterior
COPY --from=builder /srv/app /srv/app

# Remover devDeps para reduzir tamanho
RUN npm prune --omit=dev

ENV HOST=0.0.0.0
ENV PORT=1337

EXPOSE 1337

CMD ["npm", "start"]
