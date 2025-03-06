import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatDialog from '../components/ChatDialog';
import { opprettInitiativ, opprettInitiativFraDialog } from '../services/initiativService';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visBulkInput, setVisBulkInput] = useState(false);
  
  const [formData, setFormData] = useState({
    tittel: '',
    beskrivelse: '',
    maal: '',
    status: 'Ide',
    ansvarlig: '',
    prioritet: 'Medium'
  });

  const [bulkTekst, setBulkTekst] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBulkAnalyse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await opprettInitiativFraDialog(bulkTekst);
      navigate(`/initiativer/${response._id}`);
    } catch (err) {
      setError('Kunne ikke analysere teksten. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await opprettInitiativ(formData);
      navigate(`/initiativer/${response._id}`);
    } catch (err) {
      setError('Kunne ikke opprette initiativet. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Nytt KI-Initiativ</h1>
      
      <div className="mb-6">
        <button
          onClick={() => setVisBulkInput(!visBulkInput)}
          className="btn btn-secondary mb-4"
        >
          {visBulkInput ? 'Bruk skjema' : 'Generer fra tekst'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {visBulkInput ? (
        <div className="space-y-4">
          <div>
            <label className="form-label">
              Lim inn tekst for analyse
            </label>
            <textarea
              value={bulkTekst}
              onChange={(e) => setBulkTekst(e.target.value)}
              className="form-input h-64"
              placeholder="Lim inn tekst her for å automatisk generere initiativ-informasjon..."
            />
          </div>
          <button
            onClick={handleBulkAnalyse}
            disabled={loading || !bulkTekst.trim()}
            className="btn btn-primary w-full"
          >
            {loading ? 'Analyserer...' : 'Analyser og opprett initiativ'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Tittel</label>
            <input
              type="text"
              name="tittel"
              value={formData.tittel}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Beskrivelse</label>
            <textarea
              name="beskrivelse"
              value={formData.beskrivelse}
              onChange={handleInputChange}
              className="form-input h-32"
              required
            />
          </div>

          <div>
            <label className="form-label">Mål</label>
            <textarea
              name="maal"
              value={formData.maal}
              onChange={handleInputChange}
              className="form-input h-32"
              required
            />
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="Ide">Idé</option>
              <option value="Under vurdering">Under vurdering</option>
              <option value="Planlegging">Planlegging</option>
              <option value="Utvikling">Utvikling</option>
              <option value="Testing">Testing</option>
              <option value="Implementert">Implementert</option>
              <option value="Avsluttet">Avsluttet</option>
              <option value="Kansellert">Kansellert</option>
            </select>
          </div>

          <div>
            <label className="form-label">Ansvarlig</label>
            <input
              type="text"
              name="ansvarlig"
              value={formData.ansvarlig}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Prioritet</label>
            <select
              name="prioritet"
              value={formData.prioritet}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="Høy">Høy</option>
              <option value="Medium">Medium</option>
              <option value="Lav">Lav</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Oppretter...' : 'Opprett initiativ'}
          </button>
        </form>
      )}
    </div>
  );
};

export default NyttInitiativ; 