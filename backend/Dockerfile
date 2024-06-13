# Utilizza un'immagine di base Node.js
FROM node:latest

# Imposta la directory di lavoro
WORKDIR /backend

# Copia tutto il codice sorgente dell'app
COPY ./application .

# Installa le dipendenze
RUN npm install

WORKDIR /backend/application

# Compila l'app per la produzione
CMD npm run start