const OpenAI = require('openai');
require('dotenv').config();

// Initialiser OpenAI-klienten
let openai;

// Sjekk om vi er i testmiljø
if (process.env.NODE_ENV === 'test') {
  // I testmiljø bruker vi en mock-versjon
  openai = {
    chat: {
      completions: {
        create: async ({ messages }) => {
          // Sjekk om dette er en forespørsel om å kaste en feil
          if (messages.some(m => m.content && m.content.includes('kast_feil'))) {
            throw new Error('API-feil');
          }
          
          // Sjekk om dette er en forespørsel om oppfølgingsspørsmål
          if (messages.some(m => m.content && m.content.includes('Initiativ:'))) {
            return {
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
            };
          }
          
          // Standard respons
          return {
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
          };
        }
      }
    }
  };
} else {
  // I produksjon bruker vi den ekte OpenAI-klienten
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Opprett OpenAI-klient
function getOpenAIClient() {
  // For tester, returner en mock-klient
  if (process.env.NODE_ENV === 'test') {
    return {
      chat: {
        completions: {
          create: async () => ({
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
    };
  }
  
  // For produksjon, returner en ekte OpenAI-klient
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Prosesserer brukerens dialog og genererer strukturert initiativdata
 * @param {string} message - Brukerens melding
 * @returns {Object} Strukturert initiativdata
 */
exports.processInitiativDialog = async (message) => {
  try {
    const systemMessage = {
      role: "system",
      content: `Du er en assistent som hjelper med å opprette KI-initiativer. 
      Basert på brukerens beskrivelse, lag et strukturert JSON-objekt med følgende felt:
      - tittel: en kort, beskrivende tittel for initiativet
      - beskrivelse: en detaljert beskrivelse av initiativet
      - maal: en beskrivelse av målet med initiativet (tekst, ikke liste)
      - ansvarlig: hvem som er ansvarlig (bruk "Ikke tildelt" hvis ikke spesifisert)
      - status: sett til "Ide" som standard
      - prioritet: sett til "Medium" som standard
      
      Returner KUN et gyldig JSON-objekt uten noen annen tekst.`
    };

    const userMessage = {
      role: "user",
      content: message
    };

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content.trim();
    console.log("OpenAI response:", content);
    
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (error) {
      console.error("JSON parsing error:", error);
      throw new Error("Kunne ikke tolke svaret fra AI-tjenesten");
    }
    
    // Sikre at alle nødvendige felt er til stede
    const defaultData = {
      tittel: parsedData.tittel || "Nytt KI-initiativ",
      beskrivelse: parsedData.beskrivelse || "Ingen beskrivelse tilgjengelig",
      maal: parsedData.maal || "Ingen mål definert",
      ansvarlig: parsedData.ansvarlig || "Ikke tildelt",
      status: parsedData.status || "Ide",
      prioritet: parsedData.prioritet || "Medium",
      startDato: new Date(),
      kommentarer: "",
      vedlegg: [],
      handlinger: []
    };
    
    return defaultData;
  } catch (error) {
    console.error("Error in processInitiativDialog:", error);
    throw new Error(`Feil ved prosessering av dialog: ${error.message}`);
  }
};

/**
 * Genererer oppfølgingsspørsmål basert på initiativdata
 * @param {Object} initiativData - Data om initiativet
 * @returns {Array} Liste med oppfølgingsspørsmål
 */
exports.generateFollowUpQuestions = async (initiativData) => {
  try {
    // Opprett en systemmelding for oppfølgingsspørsmål
    const followUpSystemMessage = `
    Du er en assistent som hjelper med å forbedre KI-initiativer.
    Basert på den gitte informasjonen om et initiativ, generer 3 relevante oppfølgingsspørsmål.
    Returner BARE en JSON-array med spørsmålene, uten noen annen tekst.
    `;
    
    // Opprett en samtale med systemmelding og initiativdata
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: followUpSystemMessage },
        { role: "user", content: `Initiativ: ${JSON.stringify(initiativData)}` }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    // Hent ut svaret fra GPT
    const response = completion.choices[0].message.content;
    console.log('OpenAI-respons (oppfølgingsspørsmål):', response);
    
    // Fjern eventuelle markdown-kodeblokker
    const cleanedResponse = response.replace(/```json\s*|\s*```/g, '');
    
    // Parse JSON-svaret
    let questions;
    try {
      questions = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Kunne ikke parse JSON-svar:', cleanedResponse);
      return [
        'Hva er målet med dette initiativet?',
        'Hvem skal være ansvarlig?',
        'Når forventer du at dette skal være ferdig?'
      ];
    }
    
    // Hvis svaret er en array, returner den direkte
    if (Array.isArray(questions)) {
      return questions;
    }
    
    // Hvis svaret er et objekt med en questions-egenskap, returner den
    if (questions.questions && Array.isArray(questions.questions)) {
      return questions.questions;
    }
    
    // Ellers, returner standard spørsmål
    return [
      'Hva er målet med dette initiativet?',
      'Hvem skal være ansvarlig?',
      'Når forventer du at dette skal være ferdig?'
    ];
  } catch (error) {
    console.error('Feil ved generering av oppfølgingsspørsmål:', error);
    return [
      'Hva er målet med dette initiativet?',
      'Hvem skal være ansvarlig?',
      'Når forventer du at dette skal være ferdig?'
    ];
  }
};

/**
 * Fortsetter en eksisterende dialog for å samle inn mer informasjon
 * @param {Array} messages - Tidligere meldinger i dialogen
 * @param {string} newMessage - Brukerens nye melding
 * @returns {Object} Oppdatert initiativdata
 */
exports.continueInitiativDialog = async (messages, newMessage) => {
  try {
    // Systemmelding som definerer hvordan GPT skal oppføre seg
    const systemMessage = `
    Du er en assistent som hjelper med å opprette KI-initiativer. 
    Basert på brukerens meldinger, opprett et strukturert initiativ med følgende felter:
    
    - tittel: Navn på initiativet
    - beskrivelse: Detaljert beskrivelse
    - maal: Målet med initiativet
    - ansvarlig: Person som er ansvarlig (bruk "Ikke tildelt" hvis ukjent)
    - status: Sett til "Ide"
    - prioritet: Sett til "Medium"
    
    Returner BARE et JSON-objekt med disse feltene, uten noen annen tekst.
    `;
    
    // Opprett en samtale med systemmelding og tidligere meldinger
    const chatMessages = [
      { role: "system", content: systemMessage },
      ...messages,
      { role: "user", content: newMessage }
    ];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000
    });
    
    // Hent ut svaret fra GPT
    const response = completion.choices[0].message.content;
    console.log('OpenAI-respons (fortsett dialog):', response);
    
    // Fjern eventuelle markdown-kodeblokker
    const cleanedResponse = response.replace(/```json\s*|\s*```/g, '');
    
    // Parse JSON-svaret
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Kunne ikke parse JSON-svar:', cleanedResponse);
      throw new Error('Kunne ikke tolke AI-responsen som JSON');
    }
    
    // Sørg for at alle nødvendige felter er til stede
    const defaultData = {
      status: 'Ide',
      prioritet: 'Medium',
      ansvarlig: 'Ikke tildelt'
    };
    
    // Kombiner default-data med data fra AI
    parsedResponse = { ...defaultData, ...parsedResponse };
    
    return {
      ...parsedResponse,
      isComplete: true
    };
  } catch (error) {
    console.error('OpenAI API-feil:', error);
    throw new Error('Feil ved prosessering av dialog: ' + error.message);
  }
};

/**
 * Analyserer Excel-data og konverterer det til strukturerte initiativ-objekter
 * @param {string} prompt - Prompt med Excel-data for analyse
 * @returns {Array} Array med strukturerte initiativ-objekter
 */
exports.analyzeExcelData = async (prompt) => {
  try {
    const systemMessage = `
      Du er en ekspert på å analysere Excel-data og konvertere dem til strukturerte JSON-objekter.
      Din oppgave er å analysere data fra en Excel-fil og konvertere dem til et array av KI-initiativ-objekter.
      
      Hvert initiativ skal ha følgende struktur:
      {
        "tittel": "Tittel på initiativet",
        "beskrivelse": "Detaljert beskrivelse av initiativet",
        "maal": "Målsetting for initiativet",
        "status": "Ide/Mockup/PoC/Utvikling/Implementert/Avsluttet",
        "ansvarlig": "Navn på ansvarlig person",
        "prioritet": "Lav/Medium/Høy/Kritisk",
        "startDato": "YYYY-MM-DD" (bruk faktisk dato, IKKE bruk "YYYY-MM-DD" som tekst),
        "sluttDato": "YYYY-MM-DD" (valgfritt, kan være null)
      }
      
      VIKTIG:
      1. For datoer, bruk ALLTID faktiske datoer i formatet YYYY-MM-DD, ALDRI bruk "YYYY-MM-DD" som en placeholder.
      2. Hvis du ikke kan finne en dato, bruk dagens dato for startDato og null for sluttDato.
      3. Hvis du ser datoer i formatet DD.MM.YYYY, konverter dem til YYYY-MM-DD.
      4. Hvis du ser datoer som tall (Excel-datoer), konverter dem til YYYY-MM-DD.
      
      Eksempler på gode datoer: "2024-05-15", "2023-12-31"
      Eksempler på dårlige datoer: "YYYY-MM-DD", "DD-MM-YYYY", "ukjent"
      
      Returner et JSON-array med alle initiativene.
    `;

    const userMessage = prompt;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content.trim();
    console.log('OpenAI Excel-analyse respons mottatt');

    try {
      // Parse JSON-responsen
      const parsedContent = JSON.parse(content);
      
      // Sjekk om vi har et array av initiativer
      let initiatives = [];
      
      if (parsedContent.initiatives) {
        initiatives = parsedContent.initiatives;
      } else if (Array.isArray(parsedContent)) {
        initiatives = parsedContent;
      } else {
        // Prøv å finne et array i responsen
        for (const key in parsedContent) {
          if (Array.isArray(parsedContent[key])) {
            initiatives = parsedContent[key];
            break;
          }
        }
      }
      
      if (!Array.isArray(initiatives)) {
        throw new Error('Forventet et array av initiativer, men fikk: ' + typeof initiatives);
      }

      // Valider og fyll inn manglende felt
      const validatedInitiatives = initiatives.map(initiative => {
        // Sørg for at alle nødvendige felt er til stede
        const validatedInitiative = {
          tittel: initiative.tittel || 'Ukjent initiativ',
          beskrivelse: initiative.beskrivelse || 'Hva er tilaket ? Hvilke oppgaver skal støttes/løses ?',
          maal: initiative.maal || `Målet med initiativet er å ${initiative.tittel ? initiative.tittel.toLowerCase() : 'forbedre prosesser'}.`,
          status: initiative.status || 'Ide',
          ansvarlig: initiative.ansvarlig || 'Ikke tildelt',
          prioritet: initiative.prioritet || 'Medium',
          startDato: null,
          sluttDato: null
        };

        // Valider startDato
        if (initiative.startDato && typeof initiative.startDato === 'string') {
          if (isValidDateString(initiative.startDato)) {
            validatedInitiative.startDato = initiative.startDato;
          } else if (initiative.startDato.includes('.')) {
            // Prøv å konvertere fra norsk datoformat (DD.MM.YYYY)
            const parts = initiative.startDato.split('.');
            if (parts.length === 3) {
              const year = parts[2].padStart(4, '20'); // Antar 20xx hvis bare to siffer
              const month = parts[1].padStart(2, '0');
              const day = parts[0].padStart(2, '0');
              validatedInitiative.startDato = `${year}-${month}-${day}`;
            }
          }
        }
        
        // Hvis startDato fortsatt er null eller ugyldig, bruk dagens dato
        if (!validatedInitiative.startDato || !isValidDateString(validatedInitiative.startDato) || 
            validatedInitiative.startDato === 'YYYY-MM-DD') {
          validatedInitiative.startDato = new Date().toISOString().split('T')[0];
        }

        // Valider sluttDato
        if (initiative.sluttDato && typeof initiative.sluttDato === 'string') {
          if (isValidDateString(initiative.sluttDato)) {
            validatedInitiative.sluttDato = initiative.sluttDato;
          } else if (initiative.sluttDato.includes('.')) {
            // Prøv å konvertere fra norsk datoformat (DD.MM.YYYY)
            const parts = initiative.sluttDato.split('.');
            if (parts.length === 3) {
              const year = parts[2].padStart(4, '20'); // Antar 20xx hvis bare to siffer
              const month = parts[1].padStart(2, '0');
              const day = parts[0].padStart(2, '0');
              validatedInitiative.sluttDato = `${year}-${month}-${day}`;
            }
          }
        }
        
        // Hvis sluttDato er ugyldig eller 'YYYY-MM-DD', sett den til null
        if (validatedInitiative.sluttDato === 'YYYY-MM-DD' || 
            (validatedInitiative.sluttDato && !isValidDateString(validatedInitiative.sluttDato))) {
          validatedInitiative.sluttDato = null;
        }

        return validatedInitiative;
      });

      return validatedInitiatives;
    } catch (error) {
      console.error('Feil ved parsing av OpenAI-respons:', error);
      console.error('Rå respons:', content);
      throw new Error('Kunne ikke analysere Excel-dataene. Feil ved parsing av OpenAI-respons.');
    }
  } catch (error) {
    console.error('Feil ved OpenAI Excel-analyse:', error);
    throw new Error('Kunne ikke analysere Excel-dataene. Prøv igjen senere.');
  }
};

/**
 * Sjekker om en streng er en gyldig dato i formatet YYYY-MM-DD
 * @param {string} dateString - Datostrengen som skal valideres
 * @returns {boolean} True hvis datoen er gyldig, ellers false
 */
function isValidDateString(dateString) {
  if (!dateString) return false;
  
  // Sjekk om strengen matcher YYYY-MM-DD formatet
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  // Sjekk om datoen er gyldig
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;
  
  return date.toISOString().split('T')[0] === dateString;
} 