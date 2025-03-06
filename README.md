# KI-Oversikt

En moderne webapplikasjon for å håndtere og oversikt over KI-initiativer. Applikasjonen bruker Azure-tjenester og OpenAI for å forenkle prosessen med å opprette og administrere KI-prosjekter.

## Funksjoner

- 🤖 Automatisk generering av KI-initiativer fra naturlig språk
- 📊 Oversiktlig dashboard for alle KI-prosjekter
- 🔄 Interaktiv dialog for å forbedre initiativer
- 📝 Detaljert visning av hvert initiativ
- 🔍 Søk og filtrering av initiativer
- 📈 Statusoppdateringer og fremgang
- 🔐 Sikker autentisering og autorisering

## Teknologier

- Frontend: React med TypeScript
- Backend: Node.js med Express
- Database: MongoDB
- Cloud: Azure (App Service, Key Vault, Storage)
- AI: OpenAI GPT-3.5
- Testing: Jest

## Installasjon

### Forutsetninger

- Node.js (v18 eller nyere)
- MongoDB
- Azure-konto
- OpenAI API-nøkkel

### Lokal utvikling

1. Klon repositoriet:
```bash
git clone https://github.com/trygverefvem/KI-Oversikt.git
cd KI-Oversikt
```

2. Installer avhengigheter:
```bash
# Installer backend-avhengigheter
cd backend
npm install

# Installer frontend-avhengigheter
cd ../frontend
npm install
```

3. Opprett `.env`-filer:

Backend (`.env`):
```env
MONGODB_URI=din_mongodb_uri
OPENAI_API_KEY=din_openai_api_nøkkel
AZURE_TENANT_ID=din_azure_tenant_id
AZURE_CLIENT_ID=din_azure_client_id
AZURE_CLIENT_SECRET=din_azure_client_secret
```

Frontend (`.env`):
```env
REACT_APP_API_URL=http://localhost:3001
```

4. Start utviklingsserverne:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Testing

Kjør tester for både frontend og backend:

```bash
# Backend-tester
cd backend
npm test

# Frontend-tester
cd frontend
npm test
```

## Deployment

Applikasjonen er konfigurert for deployment til Azure:

1. Frontend deployes til Azure Storage Account
2. Backend deployes til Azure App Service
3. API-nøkler og hemmeligheter lagres i Azure Key Vault

## Bidrag

1. Fork repositoriet
2. Opprett en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit endringene dine (`git commit -m 'Add some AmazingFeature'`)
4. Push til branchen (`git push origin feature/AmazingFeature`)
5. Åpne en Pull Request

## Lisens

Dette prosjektet er lisensiert under MIT-lisensen - se [LICENSE](LICENSE) filen for detaljer.

## Kontakt

Trygve Refvem - [@trygverefvem](https://github.com/trygverefvem)

Prosjekt Link: [https://github.com/trygverefvem/KI-Oversikt](https://github.com/trygverefvem/KI-Oversikt) 