# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Vite gera dist/ (normaliza tudo para /out)
RUN mkdir -p /out && cp -r dist/* /out/

# ---------- Stage 2: serve ----------
FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
