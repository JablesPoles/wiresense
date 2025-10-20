# --- Estágio 1: Build da Aplicação React ---
FROM node:22-bullseye AS build

WORKDIR /app

# Declara os argumentos de build
ARG VITE_INFLUX_URL
ARG VITE_INFLUX_TOKEN
ARG VITE_INFLUX_ORG
ARG VITE_INFLUX_BUCKET

# Expõe como variáveis de ambiente para o Vite
ENV VITE_INFLUX_URL=$VITE_INFLUX_URL
ENV VITE_INFLUX_TOKEN=$VITE_INFLUX_TOKEN
ENV VITE_INFLUX_ORG=$VITE_INFLUX_ORG
ENV VITE_INFLUX_BUCKET=$VITE_INFLUX_BUCKET

# Copia apenas os arquivos de dependência (melhor uso do cache)
COPY package*.json ./

# Instala dependências (com npm 9)
RUN npm install

# Copia o restante do código
COPY . .

# Executa o build do Vite
RUN npm run build

# --- Estágio 2: Servir com Nginx ---
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
