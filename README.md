# KI-Oversikt

En interaktiv webapplikasjon for oppretting og oppfølging av KI-initiativer.

## Funksjonalitet

- Naturlig språk og dialog for oppretting av initiativer
- Strukturert datalagring og visning
- Statusbasert visuell oppdatering
- Integrasjon med OpenAI GPT-modeller
- Business Canvas for visualisering av forretningsmodell
- PDF-eksport av Business Canvas

## Teknisk Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI-integrasjon**: OpenAI API
- **Containerisering**: Docker
- **Cloud**: Azure App Service, Azure Cosmos DB

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

### Metode 2: Bruk Docker Compose

```bash
# Bygg og start alle tjenester
docker-compose up --build

# Kjør i bakgrunnen
docker-compose up -d
```

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

## Deployment til Azure

Prosjektet er konfigurert for deployment til Azure ved hjelp av Docker-containere. Se følgende filer for detaljer:

- `azure-deployment-plan.md` - Detaljert plan for Azure-deployment
- `azure-cli-commands.md` - Azure CLI-kommandoer for manuelt oppsett
- `.github/workflows/azure-deploy.yml` - GitHub Actions workflow for automatisk deployment

### Kort oversikt over Azure-deployment

1. Bygg Docker-images for frontend og backend
2. Push images til Azure Container Registry
3. Deploy til Azure App Service
4. Konfigurer Azure Cosmos DB for MongoDB API
5. Sett opp miljøvariabler og sikkerhet

For detaljerte instruksjoner, se `azure-deployment-plan.md`.

## Prosjektstruktur

```
ki-oversikt/
├── backend/           # Node.js/Express backend
│   ├── controllers/   # API-kontrollere
│   ├── models/        # MongoDB-modeller
│   ├── routes/        # API-ruter
│   ├── services/      # Tjenester (inkl. OpenAI-integrasjon)
│   ├── Dockerfile     # Docker-konfigurasjon for backend
│   └── server.js      # Hovedapplikasjonsfil
│
├── frontend/          # React frontend
│   ├── public/        # Statiske filer
│   ├── src/           # Kildekode
│   │   ├── components/# React-komponenter
│   │   ├── pages/     # Sidekomponenter
│   │   ├── services/  # API-tjenester
│   │   └── App.tsx    # Hovedapplikasjonskomponent
│   ├── Dockerfile     # Docker-konfigurasjon for frontend
│   └── nginx.conf     # Nginx-konfigurasjon for produksjon
│
├── .github/           # GitHub Actions workflows
├── docker-compose.yml # Docker Compose-konfigurasjon
├── azure-deployment-plan.md # Plan for Azure-deployment
├── azure-cli-commands.md    # Azure CLI-kommandoer
└── README.md          # Prosjektdokumentasjon
```

## Versjonering

- **Versjon 1.0** - Grunnleggende funksjonalitet med initiativoversikt og detaljer
- **Versjon 1.1** - Lagt til Business Canvas og PDF-eksport 