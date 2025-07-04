# Dockerfile

# --- Estágio 1: Build da Aplicação React ---
FROM node:18-alpine AS build

WORKDIR /app

# 💡 DECLARE OS ARGUMENTOS AQUI, ANTES DE USÁ-LOS
ARG VITE_INFLUX_URL
ARG VITE_INFLUX_TOKEN
ARG VITE_INFLUX_ORG
ARG VITE_INFLUX_BUCKET

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

# 💡 INJETE AS VARIÁVEIS DE AMBIENTE DIRETAMENTE NO BUILD
RUN VITE_INFLUX_URL=${VITE_INFLUX_URL} \
    VITE_INFLUX_TOKEN=${VITE_INFLUX_TOKEN} \
    VITE_INFLUX_ORG=${VITE_INFLUX_ORG} \
    VITE_INFLUX_BUCKET=${VITE_INFLUX_BUCKET} \
    npm run build

# --- Estágio 2: Servir os arquivos com Nginx ---
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]