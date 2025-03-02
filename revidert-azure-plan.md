# Revidert plan for Azure-distribusjon av KI-Oversikt

## Utfordringer med opprinnelig plan
Vi har møtt flere utfordringer med den opprinnelige distribusjonsplanen:
1. Problemer med Docker-containere i Azure App Service
2. Komplisert konfigurasjon av API-ruter og proxy
3. Problemer med miljøvariabler og kommunikasjon mellom tjenester

## Ny tilnærming
Vi vil forenkle distribusjonen ved å:
1. Bruke Azure Static Web Apps for frontend
2. Bruke Azure App Service (uten Docker) for backend
3. Beholde Azure Cosmos DB for MongoDB API for databasen
4. Forenkle nettverkskonfigurasjonen

## Steg-for-steg plan

### 1. Forberedelse av applikasjonen

1. **Frontend-applikasjonen**
   - Oppdater API-URL-konfigurasjonen til å peke direkte til backend-API-et
   - Bygg applikasjonen lokalt med `npm run build`

2. **Backend-applikasjonen**
   - Sikre at API-rutene er korrekt konfigurert
   - Verifiser at MongoDB-tilkoblingen fungerer

### 2. Oppsett av Azure-ressurser

1. **Azure Cosmos DB for MongoDB API** (allerede opprettet)
   - Navn: `kioversikt-db`

2. **Azure Key Vault** (allerede opprettet)
   - Navn: `kioversikt-kv`
   - Lagrer sensitive data (OpenAI API-nøkkel, databasetilkoblingsstreng)

3. **Azure App Service for backend**
   - Navn: `kioversikt-api`
   - Runtime stack: Node.js 20 LTS
   - Distribuer koden direkte fra lokalt repo

4. **Azure Static Web App for frontend**
   - Navn: `kioversikt-app`
   - Distribuer bygget frontend-kode direkte

### 3. Distribusjon av backend

1. **Konfigurer miljøvariabler**
   ```bash
   az webapp config appsettings set --resource-group kioversikt-rg --name kioversikt-api --settings MONGODB_URI=@Microsoft.KeyVault(SecretUri=https://kioversikt-kv.vault.azure.net/secrets/MONGODB-URI/) OPENAI_API_KEY=@Microsoft.KeyVault(SecretUri=https://kioversikt-kv.vault.azure.net/secrets/OPENAI-API-KEY/) NODE_ENV=production PORT=8080
   ```

2. **Aktiver systemtildelt identitet**
   ```bash
   az webapp identity assign --resource-group kioversikt-rg --name kioversikt-api
   ```

3. **Gi tilgang til Key Vault**
   ```bash
   az role assignment create --role "Key Vault Secrets User" --assignee <principal-id> --scope <key-vault-id>
   ```

4. **Distribuer backend-kode**
   ```bash
   cd backend
   zip -r ../backend.zip .
   az webapp deployment source config-zip --resource-group kioversikt-rg --name kioversikt-api --src ../backend.zip
   ```

### 4. Distribusjon av frontend

1. **Bygg frontend-applikasjonen**
   ```bash
   cd frontend
   echo "REACT_APP_API_URL=https://kioversikt-api.azurewebsites.net" > .env
   npm run build
   ```

2. **Distribuer til Azure Static Web App**
   ```bash
   cd build
   zip -r ../frontend.zip .
   az staticwebapp create --name kioversikt-app --resource-group kioversikt-rg --location "North Europe" --sku Free
   az staticwebapp deploy --name kioversikt-app --resource-group kioversikt-rg --source ../frontend.zip
   ```

### 5. Konfigurer CORS for backend

1. **Tillat forespørsler fra frontend**
   ```bash
   az webapp cors add --resource-group kioversikt-rg --name kioversikt-api --allowed-origins "https://kioversikt-app.azurestaticapps.net"
   ```

### 6. Testing og validering

1. **Test backend API**
   - Verifiser at API-endepunkter er tilgjengelige
   - Test databasetilkobling

2. **Test frontend-applikasjon**
   - Verifiser at frontend kan kommunisere med backend
   - Test funksjonalitet

## Fordeler med den nye tilnærmingen
1. Enklere distribusjon uten Docker-kompleksitet
2. Bedre separasjon mellom frontend og backend
3. Enklere feilsøking og vedlikehold
4. Reduserte kostnader med Azure Static Web Apps for frontend 