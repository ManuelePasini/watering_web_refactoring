# Fase 1: Costruzione della build
# Utilizza un'immagine di base Node.js
FROM node:26.3-slim AS build

# Imposta la directory di lavoro
WORKDIR /app

# Copia tutto il codice sorgente dell'app
COPY . .

WORKDIR /app/SMARTER-frontend
RUN npm install
RUN npm run build

# Fase 2: Servire i file statici con Nginx
# Usa un'immagine base di Nginx
FROM nginx:1.31-alpine

COPY --from=build /app/SMARTER-frontend/dist /usr/share/nginx/html/smarter

# Copia il file di configurazione di Nginx
COPY ./nginx.conf /etc/nginx/nginx.conf

# Espone la porta 80
EXPOSE 80

# Comando per avviare Nginx
CMD ["nginx", "-g", "daemon off;"]