# Azure CLI-kommandoer for oppsett av KI-Oversikt

Dette dokumentet inneholder alle Azure CLI-kommandoer som trengs for å sette opp infrastrukturen for KI-Oversikt-applikasjonen i Azure.

## Forutsetninger
- Azure CLI installert og konfigurert
- Docker installert
- Innlogget på Azure (`az login`)

## 1. Opprett ressursgruppe

```bash
# Opprett ressursgruppe
az group create --name kioversikt-rg --location northeurope
```

## 2. Opprett Azure Container Registry

```bash
# Opprett Container Registry
az acr create --resource-group kioversikt-rg --name kioversiktacr --sku Basic --admin-enabled true

# Hent legitimasjon for Container Registry
ACR_USERNAME=$(az acr credential show --name kioversiktacr --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name kioversiktacr --query "passwords[0].value" -o tsv)
ACR_LOGIN_SERVER=$(az acr show --name kioversiktacr --query "loginServer" -o tsv)

echo "ACR Username: $ACR_USERNAME"
echo "ACR Password: $ACR_PASSWORD"
echo "ACR Login Server: $ACR_LOGIN_SERVER"
```

## 3. Opprett Azure Cosmos DB for MongoDB API

```bash
# Opprett Cosmos DB-konto
az cosmosdb create --name kioversikt-db --resource-group kioversikt-rg --kind MongoDB --capabilities EnableServerless --default-consistency-level Session

# Opprett MongoDB-database
az cosmosdb mongodb database create --account-name kioversikt-db --resource-group kioversikt-rg --name ki-oversikt

# Hent tilkoblingsstreng
MONGODB_URI=$(az cosmosdb keys list --type connection-strings --name kioversikt-db --resource-group kioversikt-rg --query "connectionStrings[0].connectionString" -o tsv)

echo "MongoDB URI: $MONGODB_URI"
```

## 4. Opprett Azure Key Vault

```bash
# Opprett Key Vault
az keyvault create --name kioversikt-kv --resource-group kioversikt-rg --location northeurope

# Legg til hemmeligheter
az keyvault secret set --vault-name kioversikt-kv --name "MONGODB-URI" --value "$MONGODB_URI"
az keyvault secret set --vault-name kioversikt-kv --name "OPENAI-API-KEY" --value "din-openai-api-nøkkel"
```

## 5. Opprett App Service Plan

```bash
# Opprett App Service Plan
az appservice plan create --name kioversikt-plan --resource-group kioversikt-rg --is-linux --sku B1
```

## 6. Bygg og push Docker-images

```bash
# Logg inn på Container Registry
az acr login --name kioversiktacr

# Bygg og push backend-image
cd backend
docker build -t kioversiktacr.azurecr.io/kioversikt-api:v1 .
docker push kioversiktacr.azurecr.io/kioversikt-api:v1

# Bygg og push frontend-image
cd ../frontend
docker build -t kioversiktacr.azurecr.io/kioversikt-app:v1 .
docker push kioversiktacr.azurecr.io/kioversikt-app:v1
```

## 7. Opprett App Services

```bash
# Opprett backend App Service
az webapp create --resource-group kioversikt-rg --plan kioversikt-plan --name kioversikt-api --deployment-container-image-name kioversiktacr.azurecr.io/kioversikt-api:v1

# Konfigurer backend-miljøvariabler
az webapp config appsettings set --resource-group kioversikt-rg --name kioversikt-api --settings \
  MONGODB_URI="@Microsoft.KeyVault(SecretUri=https://kioversikt-kv.vault.azure.net/secrets/MONGODB-URI/)" \
  OPENAI_API_KEY="@Microsoft.KeyVault(SecretUri=https://kioversikt-kv.vault.azure.net/secrets/OPENAI-API-KEY/)" \
  PORT=80 \
  NODE_ENV=production

# Opprett frontend App Service
az webapp create --resource-group kioversikt-rg --plan kioversikt-plan --name kioversikt-app --deployment-container-image-name kioversiktacr.azurecr.io/kioversikt-app:v1

# Konfigurer frontend-miljøvariabler
az webapp config appsettings set --resource-group kioversikt-rg --name kioversikt-app --settings \
  API_URL="https://kioversikt-api.azurewebsites.net" \
  NODE_ENV=production
```

## 8. Konfigurer identitet og tilganger for Key Vault

```bash
# Aktiver systemtildelt identitet for backend App Service
az webapp identity assign --resource-group kioversikt-rg --name kioversikt-api

# Hent prinsippal-ID for backend App Service
BACKEND_PRINCIPAL_ID=$(az webapp identity show --resource-group kioversikt-rg --name kioversikt-api --query principalId -o tsv)

# Gi backend App Service tilgang til Key Vault
az keyvault set-policy --name kioversikt-kv --object-id $BACKEND_PRINCIPAL_ID --secret-permissions get list
```

## 9. Konfigurer CORS

```bash
# Konfigurer CORS for backend API
az webapp cors add --resource-group kioversikt-rg --name kioversikt-api --allowed-origins "https://kioversikt-app.azurewebsites.net"
```

## 10. Aktiver HTTPS

```bash
# Tving HTTPS for backend
az webapp update --resource-group kioversikt-rg --name kioversikt-api --https-only true

# Tving HTTPS for frontend
az webapp update --resource-group kioversikt-rg --name kioversikt-app --https-only true
```

## 11. Aktiver Application Insights

```bash
# Opprett Application Insights
az monitor app-insights component create --app kioversikt-insights --location northeurope --resource-group kioversikt-rg --application-type web

# Hent instrumenteringsnøkkel
APPINSIGHTS_KEY=$(az monitor app-insights component show --app kioversikt-insights --resource-group kioversikt-rg --query instrumentationKey -o tsv)

# Legg til Application Insights i backend
az webapp config appsettings set --resource-group kioversikt-rg --name kioversikt-api --settings APPINSIGHTS_INSTRUMENTATIONKEY=$APPINSIGHTS_KEY

# Legg til Application Insights i frontend
az webapp config appsettings set --resource-group kioversikt-rg --name kioversikt-app --settings APPINSIGHTS_INSTRUMENTATIONKEY=$APPINSIGHTS_KEY
```

## 12. Konfigurer egendefinert domene (valgfritt)

```bash
# Legg til egendefinert domene for frontend
az webapp config hostname add --webapp-name kioversikt-app --resource-group kioversikt-rg --hostname ditt-domene.no

# Legg til egendefinert domene for backend
az webapp config hostname add --webapp-name kioversikt-api --resource-group kioversikt-rg --hostname api.ditt-domene.no

# Konfigurer SSL-binding (krever SSL-sertifikat)
# az webapp config ssl bind --certificate-thumbprint <thumbprint> --ssl-type SNI --name kioversikt-app --resource-group kioversikt-rg
```

## 13. Restart App Services

```bash
# Restart backend
az webapp restart --name kioversikt-api --resource-group kioversikt-rg

# Restart frontend
az webapp restart --name kioversikt-app --resource-group kioversikt-rg
```

## 14. Verifiser deployment

```bash
# Åpne frontend-applikasjonen i nettleseren
az webapp browse --name kioversikt-app --resource-group kioversikt-rg

# Sjekk backend-status
az webapp show --name kioversikt-api --resource-group kioversikt-rg --query state
``` 