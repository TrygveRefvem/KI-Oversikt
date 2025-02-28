import React, { useState } from 'react';

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
    }
  };

  // Prefill svar basert på initiativ-data hvis tilgjengelig
  React.useEffect(() => {
    if (currentStep.field === 'problem' && !currentAnswer && initiativ.beskrivelse) {
      setCurrentAnswer(initiativ.beskrivelse);
    }
  }, [currentStep, initiativ, currentAnswer]);

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