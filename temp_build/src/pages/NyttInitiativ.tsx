import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatDialog from '../components/ChatDialog';
import { opprettInitiativFraDialog } from '../services/initiativService';

const NyttInitiativ: React.FC = () => {
  const navigate = useNavigate();
  const [meldinger, setMeldinger] = useState<{ rolle: string; innhold: string }[]>([
    {
      rolle: 'system',
      innhold: 'Hei! Jeg kan hjelpe deg med å opprette et nytt KI-initiativ. Fortell meg om initiativet ditt, og jeg vil stille oppfølgingsspørsmål for å samle all nødvendig informasjon.'
    }
  ]);
  const [brukerMelding, setBrukerMelding] = useState('');
  const [laster, setLaster] = useState(false);

  const handleSendMelding = async () => {
    if (!brukerMelding.trim()) return;

    const nyBrukerMelding = { rolle: 'bruker', innhold: brukerMelding };
    setMeldinger([...meldinger, nyBrukerMelding]);
    setBrukerMelding('');
    setLaster(true);

    try {
      const respons = await opprettInitiativFraDialog(brukerMelding);
      
      if (respons.success) {
        if (respons.data.isComplete) {
          // Initiativ opprettet, legg til bekreftelsesmelding
          setMeldinger([
            ...meldinger,
            nyBrukerMelding,
            {
              rolle: 'system',
              innhold: `Takk! Initiativet "${respons.data.tittel}" er nå opprettet. Du blir nå videresendt til oversikten.`
            }
          ]);
          
          // Vent litt før navigering for å la brukeren lese bekreftelsen
          setTimeout(() => {
            navigate(`/initiativer/${respons.data._id}`);
          }, 2000);
        } else {
          // Fortsett dialogen
          setMeldinger([
            ...meldinger,
            nyBrukerMelding,
            { rolle: 'system', innhold: respons.aiResponse }
          ]);
        }
      } else {
        throw new Error(respons.message || 'Noe gikk galt');
      }
    } catch (error) {
      setMeldinger([
        ...meldinger,
        nyBrukerMelding,
        {
          rolle: 'system',
          innhold: 'Beklager, det oppstod en feil. Vennligst prøv igjen senere.'
        }
      ]);
    } finally {
      setLaster(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nytt KI-Initiativ</h1>
        <p className="mt-2 text-gray-600">
          Start en samtale for å opprette et nytt initiativ. Beskriv initiativet ditt, og jeg vil hjelpe deg med å samle all nødvendig informasjon.
        </p>
      </div>

      <div className="card">
        <ChatDialog
          meldinger={meldinger}
          brukerMelding={brukerMelding}
          onBrukerMeldingEndret={setBrukerMelding}
          onSendMelding={handleSendMelding}
          laster={laster}
        />
      </div>
    </div>
  );
};

export default NyttInitiativ; 