# Estágio 1: Build da aplicação
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copia a configuração customizada do Nginx que criamos
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia os arquivos estáticos gerados no estágio anterior
# Usando dist pois é um projeto Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
