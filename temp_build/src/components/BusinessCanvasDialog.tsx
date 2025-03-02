import React, { useState, useEffect } from 'react';

interface BusinessCanvasDialogProps {
  initiativ: any;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

interface DialogStep {
  id: string;
  title: string;
  description: string;
  question: string;
  field: string;
}

const BusinessCanvasDialog: React.FC<BusinessCanvasDialogProps> = ({ initiativ, onComplete, onCancel }) => {
  const dialogSteps: DialogStep[] = [
    {
      id: 'problem',
      title: 'Problem',
      description: 'Beskriv problemet eller utfordringen som initiativet skal løse.',
      question: 'Hva er hovedutfordringen eller problemet som dette initiativet adresserer?',
      field: 'problem'
    },
    {
      id: 'mulighetsrom',
      title: 'Mulighetsrom',
      description: 'Beskriv hvilke muligheter som finnes internt og eksternt.',
      question: 'Hvilke muligheter ser du for dette initiativet, både internt i organisasjonen og eksternt?',
      field: 'mulighetsrom'
    },
    {
      id: 'verdiloeft',
      title: 'Verdiløft',
      description: 'Beskriv hvilken verdi initiativet gir til brukerne eller organisasjonen.',
      question: 'Hvilken verdi vil dette initiativet gi til brukerne eller organisasjonen?',
      field: 'verdiloeft'
    },
    {
      id: 'avhengigheter',
      title: 'Avhengigheter',
      description: 'Beskriv hvilke avhengigheter som finnes for å lykkes med initiativet.',
      question: 'Hvilke avhengigheter har dette initiativet til andre systemer, prosesser eller organisasjoner?',
      field: 'avhengigheter'
    },
    {
      id: 'brukergruppe',
      title: 'Brukergruppe',
      description: 'Beskriv hvem som er målgruppen for initiativet.',
      question: 'Hvem er de primære og sekundære brukergruppene for dette initiativet?',
      field: 'brukergruppe'
    },
    {
      id: 'ressurser',
      title: 'Ressurser og kompetanse',
      description: 'Beskriv hvilke ressurser og kompetanse som trengs for å gjennomføre initiativet.',
      question: 'Hvilke ressurser og kompetanse er nødvendig for å gjennomføre dette initiativet?',
      field: 'ressurser'
    },
    {
      id: 'kanaler',
      title: 'Kanaler',
      description: 'Beskriv hvilke kanaler som skal brukes for å nå brukerne.',
      question: 'Hvilke kanaler vil bli brukt for å levere verdi til brukerne?',
      field: 'kanaler'
    },
    {
      id: 'kostnadsstruktur',
      title: 'Kostnadsstruktur',
      description: 'Beskriv hvilke kostnader som er forbundet med initiativet.',
      question: 'Hvilke hovedkostnader er forbundet med dette initiativet?',
      field: 'kostnadsstruktur'
    },
    {
      id: 'strategiske',
      title: 'Strategiske ambisjoner',
      description: 'Beskriv hvilke strategiske ambisjoner initiativet støtter.',
      question: 'Hvilke strategiske ambisjoner i organisasjonen støtter dette initiativet?',
      field: 'strategiske'
    },
    {
      id: 'gevinster',
      title: 'Gevinster',
      description: 'Beskriv hvilke gevinster initiativet forventes å gi.',
      question: 'Hvilke konkrete gevinster forventer du at dette initiativet vil gi?',
      field: 'gevinster'
    }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuggestion, setGeneratedSuggestion] = useState('');

  const currentStep = dialogSteps[currentStepIndex];

  const handleNext = () => {
    // Lagre svaret på gjeldende spørsmål
    setAnswers({
      ...answers,
      [currentStep.field]: currentAnswer
    });

    // Gå til neste steg eller fullfør hvis vi er på siste steg
    if (currentStepIndex < dialogSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentAnswer(''); // Nullstill svar for neste spørsmål
      setGeneratedSuggestion(''); // Nullstill generert forslag
    } else {
      // Vi er ferdige med alle spørsmål, send data tilbake
      const finalAnswers = {
        ...answers,
        [currentStep.field]: currentAnswer
      };
      onComplete(finalAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      // Sett gjeldende svar til det som ble lagret for forrige steg
      setCurrentAnswer(answers[dialogSteps[currentStepIndex - 1].field] || '');
      setGeneratedSuggestion(''); // Nullstill generert forslag
    }
  };

  // Prefill svar basert på initiativ-data hvis tilgjengelig
  useEffect(() => {
    if (currentStep.field === 'problem' && !currentAnswer && initiativ.beskrivelse) {
      setCurrentAnswer(initiativ.beskrivelse);
    }
  }, [currentStep, initiativ, currentAnswer]);

  // Funksjon for å generere forslag med GPT
  const generateSuggestion = async () => {
    setIsGenerating(true);
    try {
      // Samle informasjon om initiativet for å gi kontekst til GPT
      const initiativInfo = `
        Tittel: ${initiativ.tittel || 'Ukjent'}
        Beskrivelse: ${initiativ.beskrivelse || 'Ingen beskrivelse tilgjengelig'}
        Status: ${initiativ.status || 'Ukjent'}
        Ansvarlig: ${initiativ.ansvarlig || 'Ukjent'}
        Prioritet: ${initiativ.prioritet || 'Ukjent'}
      `;

      // Lag en prompt basert på gjeldende spørsmål og initiativ-info
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const prompt = `
        Basert på følgende informasjon om et initiativ:
        ${initiativInfo}
        
        Vennligst gi et forslag til svar på følgende spørsmål:
        "${currentStep.question}"
        
        Svar i punktliste-format med 3-5 relevante punkter.
      `;

      // Simuler API-kall til GPT (i en ekte implementasjon ville dette være et faktisk API-kall)
      // For demo-formål genererer vi noen eksempelsvar basert på spørsmålstypen
      let suggestion = '';
      
      // Simulert respons basert på felttype
      switch(currentStep.field) {
        case 'problem':
          suggestion = `• Skatteytere mangler sanntidsinnsikt i sin skattesituasjon
• Dagens løsninger gir kun periodiske oppdateringer om skattestatus
• Brukere må vente til skatteoppgjøret for å se konsekvenser av endringer
• Det er vanskelig for skatteytere å planlegge økonomien uten oppdatert skatteinformasjon`;
          break;
        case 'mulighetsrom':
          suggestion = `• Internt: Effektivisere skatteberegningsprosesser ved å automatisere sanntidsberegninger
• Internt: Redusere henvendelser til kundeservice ved å gi brukere selvbetjeningsløsninger
• Eksternt: Gi skatteytere bedre kontroll over egen økonomi gjennom sanntidsinformasjon
• Eksternt: Skape nye digitale tjenester som gir merverdi for brukerne`;
          break;
        case 'verdiloeft':
          suggestion = `• Gi skatteytere kontinuerlig innsikt i sin skattesituasjon
• Muliggjøre bedre økonomisk planlegging for privatpersoner og bedrifter
• Redusere usikkerhet knyttet til skatteberegninger
• Øke tilliten til skattesystemet gjennom åpenhet og transparens`;
          break;
        case 'avhengigheter':
          suggestion = `• Tilgang til oppdaterte data fra arbeidsgivere og finansinstitusjoner
• Integrasjon med eksisterende skattesystemer og databaser
• Sikker autentisering og personvernløsninger
• Regelverksendringer som tillater sanntidsberegning av skatt`;
          break;
        case 'brukergruppe':
          suggestion = `• Primær: Privatpersoner som betaler skatt
• Primær: Selvstendig næringsdrivende og små bedrifter
• Sekundær: Regnskapsførere og økonomiske rådgivere
• Sekundær: Skattemyndigheter og kundeservice`;
          break;
        case 'ressurser':
          suggestion = `• Teknisk kompetanse innen sanntidsberegninger og datavisualisering
• Juridisk kompetanse om skatteregler og personvern
• UX/UI-designere for brukervennlige grensesnitt
• Dataingeniører for sikker databehandling
• Prosjektledelse og implementeringskompetanse`;
          break;
        case 'kanaler':
          suggestion = `• Mobilapplikasjon for enkel tilgang på farten
• Nettportal for detaljert informasjon og beregninger
• API-integrasjoner for regnskapssystemer og økonomisk programvare
• Varslingstjenester via e-post eller SMS ved viktige endringer`;
          break;
        case 'kostnadsstruktur':
          suggestion = `• Utvikling av sanntidsberegningsmotor og algoritmer
• Infrastruktur for sikker databehandling og lagring
• Brukergrensesnitt og applikasjonsutvikling
• Testing og kvalitetssikring
• Opplæring og implementering`;
          break;
        case 'strategiske':
          suggestion = `• Digitalisering av offentlige tjenester
• Økt transparens i skattesystemet
• Forbedret brukeropplevelse for skatteytere
• Effektivisering av interne prosesser
• Innovasjon innen offentlig sektor`;
          break;
        case 'gevinster':
          suggestion = `• Økt brukertilfredshet gjennom bedre innsikt i egen skattesituasjon
• Redusert antall henvendelser til kundeservice
• Bedre etterlevelse av skatteregler gjennom økt forståelse
• Effektivisering av interne prosesser
• Reduserte kostnader knyttet til feilrettinger og klagebehandling`;
          break;
        default:
          suggestion = `• Punkt 1: Eksempel på relevant informasjon
• Punkt 2: Ytterligere relevant informasjon
• Punkt 3: Mer spesifikk informasjon relatert til spørsmålet`;
      }
      
      // Sett det genererte forslaget
      setGeneratedSuggestion(suggestion);
    } catch (error) {
      console.error('Feil ved generering av forslag:', error);
      setGeneratedSuggestion('Kunne ikke generere forslag. Vennligst prøv igjen senere.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Funksjon for å bruke det genererte forslaget
  const useSuggestion = () => {
    setCurrentAnswer(generatedSuggestion);
    setGeneratedSuggestion('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Forretningskanvas - {currentStep.title}
            </h2>
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">{currentStep.description}</p>
            <p className="font-medium text-gray-800 mb-4">{currentStep.question}</p>
            
            <div className="mb-4">
              <button
                onClick={generateSuggestion}
                disabled={isGenerating}
                className={`w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-2 flex items-center justify-center ${
                  isGenerating ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Genererer forslag...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Generer forslag med KI
                  </>
                )}
              </button>
              
              {generatedSuggestion && (
                <div className="bg-gray-50 p-3 rounded border mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700">Generert forslag:</h3>
                    <button
                      onClick={useSuggestion}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Bruk dette forslaget
                    </button>
                  </div>
                  <div className="text-gray-600 whitespace-pre-line">{generatedSuggestion}</div>
                </div>
              )}
            </div>
            
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full h-40 p-2 border rounded focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Skriv ditt svar her..."
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 rounded ${
                currentStepIndex === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Forrige
            </button>
            <div className="text-gray-500">
              Steg {currentStepIndex + 1} av {dialogSteps.length}
            </div>
            <button
              onClick={handleNext}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {currentStepIndex < dialogSteps.length - 1 ? 'Neste' : 'Fullfør'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCanvasDialog; 