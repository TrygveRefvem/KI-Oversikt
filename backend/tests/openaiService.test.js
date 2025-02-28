const openaiService = require('../services/openaiService');

// Mock OpenAI-modulen
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockImplementation(({ messages }) => {
              // Sjekk om dette er en forespørsel om å kaste en feil
              if (messages.some(m => m.content.includes('kast_feil'))) {
                return Promise.reject(new Error('API-feil'));
              }
              
              // Sjekk om dette er en forespørsel om oppfølgingsspørsmål
              if (messages.some(m => m.content.includes('Initiativ:'))) {
                return Promise.resolve({
                  choices: [
                    {
                      message: {
                        content: JSON.stringify([
                          'Hva er målet med dette initiativet?',
                          'Hvem skal være ansvarlig?',
                          'Når forventer du at dette skal være ferdig?'
                        ])
                      }
                    }
                  ]
                });
              }
              
              // Standard respons
              return Promise.resolve({
                choices: [
                  {
                    message: {
                      content: JSON.stringify({
                        tittel: 'Automatisk generert initiativ',
                        beskrivelse: 'Dette er et automatisk generert initiativ fra en test',
                        maal: 'Teste OpenAI-integrasjonen',
                        ansvarlig: 'Test Bruker',
                        status: 'Ide',
                        prioritet: 'Medium'
                      })
                    }
                  }
                ]
              });
            })
          }
        }
      };
    })
  };
});

describe('OpenAI Service', () => {
  beforeEach(() => {
    // Tøm alle mocks mellom tester
    jest.clearAllMocks();
  });
  
  describe('processInitiativDialog', () => {
    it('skal behandle brukerens melding og returnere strukturerte data', async () => {
      const userMessage = 'Jeg vil opprette et nytt KI-initiativ for chatbot-integrasjon';
      
      const result = await openaiService.processInitiativDialog(userMessage);
      
      // Sjekk at resultatet er et objekt med forventede felter
      expect(result).toBeDefined();
      expect(result.tittel).toBe('Automatisk generert initiativ');
      expect(result.beskrivelse).toBe('Dette er et automatisk generert initiativ fra en test');
      expect(result.maal).toBe('Teste OpenAI-integrasjonen');
      expect(result.ansvarlig).toBe('Test Bruker');
      expect(result.status).toBe('Ide');
      expect(result.prioritet).toBe('Medium');
    });
    
    it('skal håndtere feil fra OpenAI API', async () => {
      const userMessage = 'kast_feil';
      
      // Sjekk at funksjonen kaster en feil
      await expect(openaiService.processInitiativDialog(userMessage)).rejects.toThrow('API-feil');
    });
  });
  
  describe('generateFollowUpQuestions', () => {
    it('skal generere oppfølgingsspørsmål basert på initiativdata', async () => {
      const initiativData = {
        tittel: 'Test Initiativ',
        beskrivelse: 'Kort beskrivelse'
      };
      
      // Sjekk at funksjonen returnerer en liste med spørsmål
      const questions = await openaiService.generateFollowUpQuestions(initiativData);
      
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(3);
      expect(questions[0]).toBe('Hva er målet med dette initiativet?');
    });
  });
}); 