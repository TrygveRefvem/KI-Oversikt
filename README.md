# KI-Oversikt

En interaktiv webapplikasjon for oppretting og oppfølging av KI-initiativer.

## Funksjonalitet

- Naturlig språk og dialog for oppretting av initiativer
- Strukturert datalagring og visning
- Statusbasert visuell oppdatering
- Integrasjon med OpenAI GPT-modeller

## Teknisk Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI-integrasjon**: OpenAI API

## Installasjon

### Forutsetninger
- Node.js (v16 eller nyere)
- MongoDB
- OpenAI API-nøkkel

### Installasjon

1. Klon repositoriet
2. Installer avhengigheter:
   ```
   # Installer alle avhengigheter (root, backend og frontend)
   npm run install:all
   
   # Eller installer hver for seg:
   # Installer backend-avhengigheter
   cd backend
   npm install

   # Installer frontend-avhengigheter
   cd ../frontend
   npm install
   ```
3. Opprett en `.env`-fil i backend-mappen med følgende variabler:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ki-oversikt
   OPENAI_API_KEY=din_api_nøkkel
   NODE_ENV=development
   ```

## Kjøre applikasjonen

Du kan starte applikasjonen på to måter:

### Metode 1: Start backend og frontend separat (anbefalt for utvikling)

```
# Start backend (i ett terminalvindu)
npm run start:backend
# eller
cd backend
npm run dev

# Start frontend (i et annet terminalvindu)
npm run start:frontend
# eller
cd frontend
npm start
```

### Metode 2: Bruk informasjonskommandoen

```
npm start
```
Dette vil vise instruksjoner for hvordan du starter applikasjonen.

## Testing

For å kjøre tester:

```
# Kjør alle tester (både backend og frontend)
npm test

# Kjør bare backend-tester
npm run test:backend

# Kjør bare frontend-tester
npm run test:frontend
```

### Testdekning

- **Backend-tester**: API-endepunkter, modellvalidering, OpenAI-integrasjon
- **Frontend-tester**: Komponenttesting, brukergrensesnitt, API-integrasjon

### Testmiljø

Testene kjører i et isolert miljø med følgende egenskaper:
- In-memory MongoDB for databasetester
- Mock av OpenAI API for AI-integrasjonstester
- Jest og React Testing Library for frontend-tester
- Supertest for API-testing

### Feilsøking

Hvis du opplever problemer med testene, sjekk følgende:
1. Sørg for at alle avhengigheter er installert (`npm run install:all`)
2. Sjekk at `.env.test`-filen eksisterer i både backend- og frontend-mappene
3. For OpenAI-relaterte tester, sørg for at `NODE_ENV=test` er satt i miljøvariablene

## Prosjektstruktur

```
ki-oversikt/
├── backend/           # Node.js/Express backend
│   ├── controllers/   # API-kontrollere
│   ├── models/        # MongoDB-modeller
│   ├── routes/        # API-ruter
│   ├── services/      # Tjenester (inkl. OpenAI-integrasjon)
│   └── server.js      # Hovedapplikasjonsfil
│
├── frontend/          # React frontend
│   ├── public/        # Statiske filer
│   └── src/           # Kildekode
│       ├── components/# React-komponenter
│       ├── pages/     # Sidekomponenter
│       ├── services/  # API-tjenester
│       └── App.tsx    # Hovedapplikasjonskomponent
│
└── README.md          # Prosjektdokumentasjon
``` 