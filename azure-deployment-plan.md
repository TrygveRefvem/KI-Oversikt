# Plan for Azure-deployment av KI-Oversikt (Versjon 1)

## Prosjektoversikt

KI-Oversikt er en fullstack-applikasjon med følgende komponenter:
- **Frontend**: React/TypeScript med Tailwind CSS
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **AI-integrasjon**: OpenAI API

## Deploymentmetode

Vi vil bruke Azure App Service for både frontend og backend, og Azure Cosmos DB for MongoDB API for databasen. Dette gir oss en skalerbar, administrert løsning som er enkel å vedlikeholde.

## Steg-for-steg plan

### 1. Forberedelse av applikasjonen

1. **Bygg frontend-applikasjonen**
   - Kjør `npm run build` i frontend-mappen for å generere statiske filer
   - Verifiser at bygget fungerer lokalt

2. **Konfigurer backend for produksjon**
   - Oppdater miljøvariabler for produksjonsmiljø
   - Fjern utviklingsavhengigheter som ikke trengs i produksjon

3. **Forbered Docker-filer**
   - Lag Dockerfile for frontend
   - Lag Dockerfile for backend
   - Lag docker-compose.yml for lokal testing

### 2. Oppsett av Azure-ressurser

1. **Opprett Azure-ressursgruppe**
   - Navn: `kioversikt-rg`
   - Region: `North Europe` (eller annen passende region)

2. **Opprett Azure Cosmos DB for MongoDB API**
   - Navn: `kioversikt-db`
   - API: MongoDB
   - Kapasitetsmodus: Serverless (for kostnadseffektivitet)
   - Backup-policy: Periodisk

3. **Opprett Azure Container Registry (ACR)**
   - Navn: `kioversiktacr`
   - SKU: Basic
   - Admin-bruker: Aktivert

4. **Opprett Azure App Service Plan**
   - Navn: `kioversikt-plan`
   - OS: Linux
   - Prisnivå: B1 (Basic) for testing, P1V2 (Premium) for produksjon

5. **Opprett Azure App Service for backend**
   - Navn: `kioversikt-api`
   - Runtime stack: Node.js 20 LTS
   - Koble til Container Registry

6. **Opprett Azure App Service for frontend**
   - Navn: `kioversikt-app`
   - Runtime stack: Node.js 20 LTS
   - Koble til Container Registry

7. **Konfigurer Azure Key Vault**
   - Navn: `kioversikt-kv`
   - Lagre sensitive data (OpenAI API-nøkkel, databasetilkoblingsstreng)

### 3. Bygg og push Docker-images

1. **Logg inn på Azure Container Registry**
   ```bash
   az acr login --name kioversiktacr
   ```

2. **Bygg og push backend-image**
   ```bash
   cd backend
   docker build -t kioversiktacr.azurecr.io/kioversikt-api:v1 .
   docker push kioversiktacr.azurecr.io/kioversikt-api:v1
   ```

3. **Bygg og push frontend-image**
   ```bash
   cd frontend
   docker build -t kioversiktacr.azurecr.io/kioversikt-app:v1 .
   docker push kioversiktacr.azurecr.io/kioversikt-app:v1
   ```

### 4. Konfigurer App Services

1. **Konfigurer backend App Service**
   - Miljøvariabler:
     - `MONGODB_URI`: Cosmos DB-tilkoblingsstreng
     - `PORT`: 80
     - `NODE_ENV`: production
     - `OPENAI_API_KEY`: Hentes fra Key Vault
   - Aktiver kontinuerlig deployment fra Container Registry

2. **Konfigurer frontend App Service**
   - Miljøvariabler:
     - `REACT_APP_API_URL`: URL til backend API
     - `NODE_ENV`: production
   - Aktiver kontinuerlig deployment fra Container Registry

3. **Konfigurer CORS i backend**
   - Tillat forespørsler fra frontend App Service URL

### 5. Konfigurer nettverkssikkerhet

1. **Konfigurer App Service-nettverksregler**
   - Begrens tilgang til backend API fra frontend App Service
   - Konfigurer IP-restriksjoner etter behov

2. **Konfigurer Cosmos DB-nettverksregler**
   - Begrens tilgang til kun backend App Service

3. **Aktiver HTTPS**
   - Konfigurer SSL-sertifikater
   - Tving HTTPS-omdirigering

### 6. Konfigurer overvåking og logging

1. **Aktiver Application Insights**
   - Koble til både frontend og backend App Services
   - Konfigurer dashboards for overvåking

2. **Konfigurer loggering**
   - Aktiver diagnostikklogging
   - Konfigurer loggoppbevaring

3. **Konfigurer varsler**
   - Sett opp varsler for høy CPU/minne-bruk
   - Sett opp varsler for feil og unntak

### 7. Testing og validering

1. **Test frontend-tilgang**
   - Verifiser at frontend-applikasjonen er tilgjengelig
   - Test responsivitet og funksjonalitet

2. **Test backend API**
   - Verifiser at API-endepunkter fungerer
   - Test autentisering og autorisasjon

3. **Test database-tilkobling**
   - Verifiser at data lagres og hentes korrekt
   - Test ytelse og responstid

### 8. Produksjonssetting

1. **Konfigurer egendefinert domene**
   - Legg til egendefinert domene i Azure App Service
   - Konfigurer DNS-innstillinger

2. **Konfigurer SSL-sertifikat**
   - Bruk Azure-administrert sertifikat eller importer eget

3. **Utfør endelig testing**
   - Gjennomfør ende-til-ende-testing
   - Verifiser alle funksjoner

4. **Aktiver produksjonstrafikk**
   - Diriger trafikk til den nye applikasjonen
   - Overvåk for eventuelle problemer

## Docker-filer

### Dockerfile for backend

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 80

CMD ["node", "server.js"]
```

### Dockerfile for frontend

```dockerfile
# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf for frontend

```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://kioversikt-api.azurewebsites.net;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Estimert tidsplan

1. Forberedelse av applikasjonen: 1 dag
2. Oppsett av Azure-ressurser: 1 dag
3. Bygg og push Docker-images: 0,5 dag
4. Konfigurer App Services: 0,5 dag
5. Konfigurer nettverkssikkerhet: 0,5 dag
6. Konfigurer overvåking og logging: 0,5 dag
7. Testing og validering: 1 dag
8. Produksjonssetting: 0,5 dag

**Total estimert tid: 5-6 dager**

## Kostnadsestimater (månedlig)

- Azure App Service Plan (B1): ~$50
- Azure Cosmos DB (Serverless): ~$20-50 (avhengig av bruk)
- Azure Container Registry (Basic): ~$5
- Azure Key Vault: ~$0.03 per 10,000 operasjoner
- Application Insights: Gratis for første 5GB data

**Estimert månedlig kostnad: $75-105**

## Neste steg

1. Få godkjenning for kostnadsestimater
2. Opprette Azure-konto eller bruke eksisterende
3. Begynne med forberedelse av applikasjonen
4. Følge steg-for-steg-planen for deployment 