# PeriziaFacile - Interfaccia Web

Questo progetto fornisce un'interfaccia web per il sistema PeriziaFacile, un'architettura basata su microservizi.

Il sistema simula l'accesso ad un'area riservata di un sistema e-commerce.

Questa versione rappresenta una demo accademica.

## Dipendenze

- **orderservice** per la gestione degli ordini, disponibile al seguente [repository]:(https://github.com/lperugini/orderservice).
- **pfgateway**, API Gateway che effettua orchestrazione delle richieste e API Composition e disponibile al seguente [repository]:(https://github.com/lperugini/gateway).

## Funzionalità

- **Login** all'area riservata.
- **Visualizzare** i prodotti acquistabili.
- **Effettuare** un ordine.
- **Consultare** gli ordini effettuati.
- **Visualizzare** le proprie informazioni utente.

## Avvio dell'applicazione

### Prerequisiti
- Node.js (versione consigliata: LTS)
- NPM o Yarn

### **Esecuzione**

#### **Avvio manuale:**
```sh
npm start
```

#### **Avvio con Docker**
L'applicazione può essere containerizzata con il seguente `Dockerfile`:

```dockerfile
# Imposta la directory di lavoro
FROM node:18-alpine
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
```

Per costruire l'immagine può essere utilizzato il seguente `docker-compose.yml`:

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8090:8090"
    environment:
      - NODE_ENV=production
```

Per avviare:
```sh
docker-compose up --build
```

L'applicazione sarà disponibile su `http://localhost:8090` (porta predefinita).

---
**Autore:** _Leonardo Perugini - leonardo.perugini2@studio.unibo.it_