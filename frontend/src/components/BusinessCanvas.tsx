import React, { useState, useRef } from 'react';
import BusinessCanvasDialog from './BusinessCanvasDialog';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface BusinessCanvasProps {
  initiativ: any;
  onClose: () => void;
}

interface CanvasSection {
  id: string;
  title: string;
  content: string;
  color: string;
}

const BusinessCanvas: React.FC<BusinessCanvasProps> = ({ initiativ, onClose }) => {
  // Standard seksjoner for forretningskanvas
  const [sections, setSections] = useState<CanvasSection[]>([
    {
      id: 'problem',
      title: 'PROBLEM',
      content: initiativ.beskrivelse || 'Skatteetaten har betydelige utfordringer knyttet til forsvarlig arkivering av arkiv- og journalpliktig dokumentasjon fra e-postklinter og digitale samhandlingsløsninger.',
      color: 'bg-green-100'
    },
    {
      id: 'mulighetsrom',
      title: 'MULIGHETSROM',
      content: 'Internt:\n• Effektivisere drift og forvaltning av Skatteetaten\n• Tilby brukerne nye tjenester basert på tilgjengelig informasjon fra Skatteetaten\n\nEksternt:\n• Endre premisser for arkivering og journalføring i offentlig forvaltning',
      color: 'bg-blue-100'
    },
    {
      id: 'verdiloeft',
      title: 'VERDILØFT',
      content: '• Den enkelte ansatte vil få hjelp til arkivering og journalføring av dokumentasjon fra e-postklinter og digitale samhandlingsløsninger i form av en automatisert beslutningsstøtte.\n• Frigjøre kapasitet til bruk på kjerneoppgaver.\n• Forbedre Skatteetatens brukertjenester / tilby nye tjenester på grunn av større informasjonsfangst.',
      color: 'bg-purple-100'
    },
    {
      id: 'avhengigheter',
      title: 'AVHENGIGHETER I ETATEN',
      content: '• Eksisterende systemportefølje i Skatteetaten samt etatens sky-strategi\n• Krav og føringer knyttet til håndtering av personopplysninger\n• Krav og føringer knyttet til offentlige anskaffelser',
      color: 'bg-yellow-100'
    },
    {
      id: 'brukergruppe',
      title: 'BRUKERGRUPPE',
      content: 'Tiltenkt brukergruppe:\n• Alle ansatte i Skatteetaten\n• Andre offentlige etater\n• Arkivmiljøet i Norge\n• Borgere/skatteytere\n• Andre offentlige/private virksomheter',
      color: 'bg-red-100'
    },
    {
      id: 'ressurser',
      title: 'RESSURSER/KOMPETANSE',
      content: '• Fagkompetanse AI, maskinlæring, NLP\n• Fagkompetanse dokumentasjons-forvaltning\n• Juridisk kompetanse (personvern)\n• Forretningsutvikling\n• IT utvikling\n• Fagkompetanse offentl. anskaffelse\n• Fagkompetanse informasjonssikkerhet',
      color: 'bg-indigo-100'
    },
    {
      id: 'kanaler',
      title: 'KANALER',
      content: '• E-postklient / digitale samhandlingsløsninger (Outlook, SharePoint, Teams m.fl.)\n• Øvrige mottakskanaler (Kundelogg m.fl.)\n• Arkivsystemer (Elements / Saksmappe m.fl.)\n• Nasjonale felleskomponenter (eInnsyn)',
      color: 'bg-pink-100'
    },
    {
      id: 'kostnadsstruktur',
      title: 'KOSTNADSSTRUKTUR',
      content: '• Bygge/utvikle/teste egen språkmodell\n• Utvikle grensesnitt mot arkivsystem(er)\n• Teste/anskaffe/drifte eksisterende løsning, inkl. lisensiering mm.\n• Tjenestedesign\n• Kompetansebygging',
      color: 'bg-gray-100'
    },
    {
      id: 'strategiske',
      title: 'STRATEGISKE AMBISJONER',
      content: 'Strategisk ambisjon 3: Forvalte e-post/dokumenter på ulike plattformer på en effektiv måte, slik at det bidrar til forenkling og digitalisering\n\nStrategisk ambisjon 4: Sammen fra start på tvers av ulike fagmiljøer for alle ansatte i Skatteetaten\n\nStrategisk ambisjon 5: Bruke data, analyse og maskinlæring i stor skala i oppgaveløsningen',
      color: 'bg-teal-100'
    },
    {
      id: 'gevinster',
      title: 'GEVINSTER',
      content: 'Gevinst 1: Sikre økt etterlevelse av regelverkskrav innen arkivering, personvern og informasjonssikkerhet\nGevinst 2: Effektivisere og forbedre arkiveringsprosesser\nGevinst 3: Frigjøre kapasitet til bruk på kjerneoppgaver\nGevinst 4: Redusere risiko for avvik og hendelser\nGevinst 5: Tilby forbedrede/nye brukertjenester',
      color: 'bg-green-100'
    }
  ]);

  const [redigererSeksjon, setRedigererSeksjon] = useState<string | null>(null);
  const [redigertInnhold, setRedigertInnhold] = useState<string>('');
  const [viserDialog, setViserDialog] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [eksporterer, setEksporterer] = useState<boolean>(false);

  const startRedigering = (seksjonId: string, innhold: string) => {
    setRedigererSeksjon(seksjonId);
    setRedigertInnhold(innhold);
  };

  const lagreEndringer = () => {
    if (!redigererSeksjon) return;
    
    setSections(sections.map(section => 
      section.id === redigererSeksjon 
        ? { ...section, content: redigertInnhold } 
        : section
    ));
    
    setRedigererSeksjon(null);
  };

  const avbrytRedigering = () => {
    setRedigererSeksjon(null);
  };

  const handleDialogComplete = (answers: Record<string, string>) => {
    // Oppdater seksjonene med svarene fra dialogen
    const oppdaterteSeksjoner = sections.map(section => {
      if (answers[section.id]) {
        return {
          ...section,
          content: answers[section.id]
        };
      }
      return section;
    });
    
    setSections(oppdaterteSeksjoner);
    setViserDialog(false);
  };

  const eksporterSomPDF = async () => {
    if (!canvasRef.current) return;
    
    try {
      setEksporterer(true);
      
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Forretningskanvas_${initiativ.tittel || 'Initiativ'}.pdf`);
    } catch (error) {
      console.error('Feil ved eksport til PDF:', error);
      alert('Det oppstod en feil ved eksport til PDF. Vennligst prøv igjen senere.');
    } finally {
      setEksporterer(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-green-50 rounded-lg p-4 w-full">
              <h1 className="text-2xl font-bold text-gray-800">
                Forretningsmodell – {initiativ.tittel || 'SKAI (Skatteetatens arkiveringsassistent)'}
              </h1>
              <p className="text-sm text-gray-500">Hva SKAL VI OPPNÅ?</p>
            </div>
            <div className="flex ml-4 space-x-2">
              <button 
                onClick={() => setViserDialog(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Generer med dialog
              </button>
              <button 
                onClick={eksporterSomPDF}
                disabled={eksporterer}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
              >
                {eksporterer ? 'Eksporterer...' : 'Eksporter som PDF'}
              </button>
              <button 
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded"
              >
                Lukk
              </button>
            </div>
          </div>

          <div ref={canvasRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.map((section) => (
              <div 
                key={section.id} 
                className={`${section.color} p-4 rounded-lg shadow ${
                  section.id === 'problem' || section.id === 'strategiske' || section.id === 'kostnadsstruktur' 
                    ? 'md:col-span-3' 
                    : 'md:col-span-1'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <button 
                    onClick={() => startRedigering(section.id, section.content)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
                
                {redigererSeksjon === section.id ? (
                  <div>
                    <textarea
                      value={redigertInnhold}
                      onChange={(e) => setRedigertInnhold(e.target.value)}
                      className="w-full h-40 p-2 border rounded mb-2"
                    />
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={lagreEndringer}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Lagre
                      </button>
                      <button 
                        onClick={avbrytRedigering}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line text-sm">{section.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {viserDialog && (
        <BusinessCanvasDialog 
          initiativ={initiativ}
          onComplete={handleDialogComplete}
          onCancel={() => setViserDialog(false)}
        />
      )}
    </div>
  );
};

export default BusinessCanvas; 