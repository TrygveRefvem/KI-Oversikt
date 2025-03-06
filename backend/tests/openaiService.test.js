const openaiService = require('../services/openaiService');
const { processInitiativDialog, getOpenAIClient } = require('../services/openaiService');

// Mock OpenAI-modulen
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  tittel: "Test-initiativ",
                  beskrivelse: "Dette er et test-initiativ",
                  maal: "Teste funksjonalitet",
                  ansvarlig: "Testbruker",
                  status: "Ide",
                  prioritet: "Medium"
                })
              }
            }
          ]
        })
      }
    }
  }));
});

// Mock Azure Identity og Key Vault
jest.mock('@azure/identity', () => ({
  DefaultAzureCredential: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@azure/keyvault-secrets', () => ({
  SecretClient: jest.fn().mockImplementation(() => ({
    getSecret: jest.fn().mockResolvedValue({ value: 'test-api-key' })
  }))
}));

describe('OpenAI Service', () => {
  beforeEach(() => {
    // Tøm alle mocks mellom tester
    jest.clearAllMocks();
  });
  
  describe('processInitiativDialog', () => {
    it('skal behandle brukerens melding og returnere strukturerte data', async () => {
      const userMessage = 'Jeg vil opprette et nytt KI-initiativ for chatbot-integrasjon';
      
      // Kjør funksjonen
      const result = await openaiService.processInitiativDialog(userMessage);
      
      // Sjekk at resultatet er et objekt med forventede felter
      expect(result).toBeDefined();
      expect(result.tittel).toBe('Test Initiativ');
      expect(result.beskrivelse).toBe('Dette er et test-initiativ');
      expect(result.maal).toBe('Teste funksjonalitet');
      expect(result.ansvarlig).toBe('Test Person');
      expect(result.status).toBe('Ikke påbegynt');
      expect(result.prioritet).toBe('Høy');
    });

    it('skal håndtere feil fra OpenAI API', async () => {
      const userMessage = 'kast_feil';
      
      // Kjør funksjonen og forvent at den returnerer data selv med feilmelding
      const result = await openaiService.processInitiativDialog(userMessage);
      expect(result).toBeDefined();
      expect(result.tittel).toBe('Test Initiativ');
    });
  });
  
  describe('Miljøvariabler og konfigurasjon', () => {
    it('skal ha tilgang til nødvendige miljøvariabler', () => {
      console.log('Miljøvariabler:', {
        NODE_ENV: process.env.NODE_ENV || 'Ikke satt',
        AZURE_TENANT_ID: process.env.AZURE_TENANT_ID || 'Ikke satt',
        AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID || 'Ikke satt',
        AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET || 'Ikke satt',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Satt' : 'Ikke satt'
      });
      
      // I testmiljø trenger vi ikke faktiske verdier
      expect(process.env.NODE_ENV).toBe('test');
    });
  });
  
  describe('OpenAI klient', () => {
    it('skal opprette OpenAI klient', async () => {
      try {
        const client = await openaiService.getOpenAIClient();
        expect(client).toBeDefined();
        console.log('OpenAI klient opprettet: Suksess');
      } catch (error) {
        console.error('Feil ved opprettelse av OpenAI klient:', error);
        throw error;
      }
    });
  });
});

describe('OpenAI Service Tests', () => {
  beforeEach(() => {
    // Sett opp test miljø
    process.env.NODE_ENV = 'test';
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    // Rydd opp etter hver test
    jest.clearAllMocks();
  });

  // Test av miljøvariabler
  test('Sjekk at nødvendige miljøvariabler er satt', () => {
    const envVars = process.env;
    console.log('Miljøvariabler:', {
      NODE_ENV: envVars.NODE_ENV,
      AZURE_TENANT_ID: envVars.AZURE_TENANT_ID ? 'Satt' : 'Ikke satt',
      AZURE_CLIENT_ID: envVars.AZURE_CLIENT_ID ? 'Satt' : 'Ikke satt',
      AZURE_CLIENT_SECRET: envVars.AZURE_CLIENT_SECRET ? 'Satt' : 'Ikke satt',
      OPENAI_API_KEY: envVars.OPENAI_API_KEY ? 'Satt' : 'Ikke satt'
    });
    
    // I testmiljø trenger vi bare OPENAI_API_KEY
    expect(process.env.OPENAI_API_KEY).toBeTruthy();
  });

  // Test av OpenAI klient opprettelse
  test('Opprett OpenAI klient', async () => {
    try {
      const client = await getOpenAIClient();
      console.log('OpenAI klient opprettet:', client ? 'Suksess' : 'Feilet');
      expect(client).toBeTruthy();
      expect(client.chat).toBeDefined();
      expect(client.chat.completions).toBeDefined();
      expect(client.chat.completions.create).toBeDefined();
    } catch (error) {
      console.error('Feil ved opprettelse av OpenAI klient:', error);
      throw error;
    }
  });

  // Test av initiativ prosessering
  test('Prosesser initiativ fra dialog', async () => {
    try {
      const message = 'Lag et initiativ for å forbedre kundeopplevelsen gjennom automatisering av kundeservice';
      const result = await processInitiativDialog(message);
      
      console.log('Prosessert initiativ:', result);
      
      // Valider resultatstruktur
      expect(result).toBeDefined();
      expect(result.tittel).toBeDefined();
      expect(result.beskrivelse).toBeDefined();
      expect(result.maal).toBeDefined();
      expect(result.ansvarlig).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.prioritet).toBeDefined();
      
      // Valider innhold
      expect(result.tittel.length).toBeGreaterThan(0);
      expect(result.beskrivelse.length).toBeGreaterThan(0);
      expect(result.maal.length).toBeGreaterThan(0);
      expect(result.status).toBe('Ikke påbegynt');
      expect(['Lav', 'Medium', 'Høy']).toContain(result.prioritet);
    } catch (error) {
      console.error('Feil ved prosessering av initiativ:', error);
      throw error;
    }
  });

  // Test av feilhåndtering
  test('Håndter ugyldig input', async () => {
    try {
      await processInitiativDialog('');
      fail('Skulle ha kastet en feil for tom melding');
    } catch (error) {
      console.log('Forventet feil fanget:', error.message);
      expect(error.message).toContain('Meldingen kan ikke være tom');
    }
  });
}); 