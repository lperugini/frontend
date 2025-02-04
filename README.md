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

### Avvio dell'applicazione
```sh
npm start
```
L'applicazione sarà disponibile su `http://localhost:3000` (porta predefinita).

---
**Autore:** _Leonardo Perugini - leonardo.perugini2@studio.unibo.it_