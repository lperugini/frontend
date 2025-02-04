# Dockerfile
FROM node:18-alpine

# Imposta la directory di lavoro
WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il codice sorgente
COPY . .

# Espone la porta dell'applicazione
EXPOSE 8090

# Comando di avvio
CMD ["node", "app.js"]