import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hentInitiativById, oppdaterInitiativ, oppdaterInitiativStatus } from '../services/initiativService';
import BusinessCanvas from '../components/BusinessCanvas';

interface Initiativ {
  _id: string;
  initiativId: string;
  tittel: string;
  beskrivelse: string;
  maal: string;
  status: string;
  ansvarlig: string;
  prioritet: string;
  startDato: string;
  sluttDato?: string;
  kommentarer?: string;
  vedlegg: Array<{
    _id: string;
    type: 'link' | 'file';
    navn: string;
    url?: string;
    filsti?: string;
  }>;
  handlinger: Array<{
    _id: string;
    beskrivelse: string;
    ansvarlig: string;
    frist: string;
    status: string;
  }>;
}

const statusFarger: Record<string, string> = {
  'Ide': 'bg-gray-100 text-gray-800',
  'Mockup': 'bg-blue-100 text-blue-800',
  'PoC': 'bg-purple-100 text-purple-800',
  'Utvikling': 'bg-yellow-100 text-yellow-800',
  'Implementert': 'bg-green-100 text-green-800',
  'Avsluttet': 'bg-red-100 text-red-800'
};

const statusAlternativer = ['Ide', 'Mockup', 'PoC', 'Utvikling', 'Implementert', 'Avsluttet'];
const prioritetAlternativer = ['Lav', 'Medium', 'Høy', 'Kritisk'];
const handlingStatusAlternativer = ['Ikke startet', 'Pågår', 'Fullført'];

const InitiativDetaljer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initiativ, setInitiativ] = useState<Initiativ | null>(null);
  const [laster, setLaster] = useState<boolean>(true);
  const [feil, setFeil] = useState<string | null>(null);
  const [redigererStatus, setRedigererStatus] = useState<boolean>(false);
  const [nyStatus, setNyStatus] = useState<string>('');
  const [redigererFelt, setRedigererFelt] = useState<string | null>(null);
  const [redigertInitiativ, setRedigertInitiativ] = useState<Partial<Initiativ>>({});
  const [lagrer, setLagrer] = useState<boolean>(false);
  const [suksessmelding, setSuksessmelding] = useState<string | null>(null);
  const [viserBusinessCanvas, setViserBusinessCanvas] = useState<boolean>(false);

  useEffect(() => {
    const lastInitiativ = async () => {
      try {
        setLaster(true);
        if (id) {
          const data = await hentInitiativById(id);
          setInitiativ(data);
          setRedigertInitiativ(data);
        }
      } catch (error) {
        console.error('Feil ved henting av initiativ:', error);
        setFeil('Kunne ikke laste initiativet. Vennligst prøv igjen senere.');
      } finally {
        setLaster(false);
      }
    };

    lastInitiativ();
  }, [id]);

  const formaterDato = (datoStreng: string) => {
    const dato = new Date(datoStreng);
    return dato.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formaterDatoForInput = (datoStreng: string) => {
    const dato = new Date(datoStreng);
    return dato.toISOString().split('T')[0];
  };

  const håndterStatusEndring = async () => {
    if (!initiativ || !nyStatus) return;

    try {
      setLagrer(true);
      await oppdaterInitiativStatus(initiativ._id, nyStatus);
      setInitiativ({ ...initiativ, status: nyStatus });
      setRedigererStatus(false);
      setSuksessmelding('Status oppdatert!');
      setTimeout(() => setSuksessmelding(null), 3000);
    } catch (error) {
      console.error('Feil ved oppdatering av status:', error);
      setFeil('Kunne ikke oppdatere status. Vennligst prøv igjen senere.');
    } finally {
      setLagrer(false);
    }
  };

  const startRedigering = (felt: string) => {
    setRedigererFelt(felt);
    setRedigertInitiativ({ ...initiativ });
  };

  const avbrytRedigering = () => {
    setRedigererFelt(null);
    setRedigertInitiativ({});
  };

  const håndterInputEndring = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRedigertInitiativ(prev => ({ ...prev, [name]: value }));
  };

  const lagreEndringer = async () => {
    if (!initiativ || !redigererFelt) return;

    try {
      setLagrer(true);
      const oppdatertInitiativ = await oppdaterInitiativ(initiativ._id, redigertInitiativ);
      setInitiativ(oppdatertInitiativ);
      setRedigererFelt(null);
      setRedigertInitiativ({});
      setSuksessmelding('Initiativ oppdatert!');
      setTimeout(() => setSuksessmelding(null), 3000);
    } catch (error) {
      console.error('Feil ved oppdatering av initiativ:', error);
      setFeil('Kunne ikke oppdatere initiativet. Vennligst prøv igjen senere.');
      setTimeout(() => setFeil(null), 3000);
    } finally {
      setLagrer(false);
    }
  };

  if (laster) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (feil) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Feil! </strong>
        <span className="block sm:inline">{feil}</span>
      </div>
    );
  }

  if (!initiativ) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Advarsel! </strong>
        <span className="block sm:inline">Ingen initiativ funnet med denne ID-en.</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {suksessmelding && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{suksessmelding}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {redigererFelt === 'tittel' ? (
              <div className="flex items-center">
                <input
                  type="text"
                  name="tittel"
                  value={redigertInitiativ.tittel || ''}
                  onChange={håndterInputEndring}
                  className="border rounded px-2 py-1 mr-2 w-full"
                />
                <button 
                  onClick={lagreEndringer} 
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  disabled={lagrer}
                >
                  {lagrer ? 'Lagrer...' : 'Lagre'}
                </button>
                <button 
                  onClick={avbrytRedigering} 
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                >
                  Avbryt
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span>{initiativ.tittel}</span>
                <button 
                  onClick={() => startRedigering('tittel')} 
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            )}
          </h1>
          <p className="text-gray-500">{initiativ.initiativId}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViserBusinessCanvas(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Forretningskanvas
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded"
          >
            Tilbake til oversikt
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Beskrivelse</h2>
            {redigererFelt === 'beskrivelse' ? (
              <div>
                <textarea
                  name="beskrivelse"
                  value={redigertInitiativ.beskrivelse || ''}
                  onChange={håndterInputEndring}
                  className="border rounded px-2 py-1 w-full h-32"
                />
                <div className="flex mt-2">
                  <button 
                    onClick={lagreEndringer} 
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    disabled={lagrer}
                  >
                    {lagrer ? 'Lagrer...' : 'Lagre'}
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
              <div>
                <p className="text-gray-600 whitespace-pre-line">{initiativ.beskrivelse}</p>
                <button 
                  onClick={() => startRedigering('beskrivelse')} 
                  className="mt-2 text-blue-500 hover:text-blue-700"
                >
                  Rediger
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Mål</h2>
            {redigererFelt === 'maal' ? (
              <div>
                <textarea
                  name="maal"
                  value={redigertInitiativ.maal || ''}
                  onChange={håndterInputEndring}
                  className="border rounded px-2 py-1 w-full h-32"
                />
                <div className="flex mt-2">
                  <button 
                    onClick={lagreEndringer} 
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    disabled={lagrer}
                  >
                    {lagrer ? 'Lagrer...' : 'Lagre'}
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
              <div>
                <p className="text-gray-600 whitespace-pre-line">{initiativ.maal}</p>
                <button 
                  onClick={() => startRedigering('maal')} 
                  className="mt-2 text-blue-500 hover:text-blue-700"
                >
                  Rediger
                </button>
              </div>
            )}
          </div>
          
          {initiativ.kommentarer && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Kommentarer</h2>
              {redigererFelt === 'kommentarer' ? (
                <div>
                  <textarea
                    name="kommentarer"
                    value={redigertInitiativ.kommentarer || ''}
                    onChange={håndterInputEndring}
                    className="border rounded px-2 py-1 w-full h-32"
                  />
                  <div className="flex mt-2">
                    <button 
                      onClick={lagreEndringer} 
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                      disabled={lagrer}
                    >
                      {lagrer ? 'Lagrer...' : 'Lagre'}
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
                <div>
                  <p className="text-gray-600 whitespace-pre-line">{initiativ.kommentarer}</p>
                  <button 
                    onClick={() => startRedigering('kommentarer')} 
                    className="mt-2 text-blue-500 hover:text-blue-700"
                  >
                    Rediger
                  </button>
                </div>
              )}
            </div>
          )}
          
          {initiativ.vedlegg && initiativ.vedlegg.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Vedlegg</h2>
              <ul className="list-disc list-inside text-gray-600">
                {initiativ.vedlegg.map((vedlegg) => (
                  <li key={vedlegg._id}>
                    {vedlegg.type === 'link' ? (
                      <a href={vedlegg.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {vedlegg.navn}
                      </a>
                    ) : (
                      <span>{vedlegg.navn}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Status</h2>
            {redigererStatus ? (
              <div>
                <select
                  value={nyStatus}
                  onChange={(e) => setNyStatus(e.target.value)}
                  className="border rounded px-2 py-1 w-full mb-2"
                >
                  <option value="">Velg status</option>
                  {statusAlternativer.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex">
                  <button
                    onClick={håndterStatusEndring}
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    disabled={!nyStatus || lagrer}
                  >
                    {lagrer ? 'Lagrer...' : 'Lagre'}
                  </button>
                  <button
                    onClick={() => setRedigererStatus(false)}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusFarger[initiativ.status] || 'bg-gray-100 text-gray-800'}`}>
                  {initiativ.status}
                </span>
                <button
                  onClick={() => {
                    setRedigererStatus(true);
                    setNyStatus(initiativ.status);
                  }}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  Endre
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Detaljer</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500">Ansvarlig</p>
                {redigererFelt === 'ansvarlig' ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="ansvarlig"
                      value={redigertInitiativ.ansvarlig || ''}
                      onChange={håndterInputEndring}
                      className="border rounded px-2 py-1 mr-2"
                    />
                    <button 
                      onClick={lagreEndringer} 
                      className="bg-green-500 text-white px-2 py-1 rounded mr-1 text-xs"
                      disabled={lagrer}
                    >
                      {lagrer ? 'Lagrer...' : 'Lagre'}
                    </button>
                    <button 
                      onClick={avbrytRedigering} 
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <p className="text-gray-700">{initiativ.ansvarlig}</p>
                    <button 
                      onClick={() => startRedigering('ansvarlig')} 
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-gray-500">Prioritet</p>
                {redigererFelt === 'prioritet' ? (
                  <div className="flex items-center">
                    <select
                      name="prioritet"
                      value={redigertInitiativ.prioritet || ''}
                      onChange={håndterInputEndring}
                      className="border rounded px-2 py-1 mr-2"
                    >
                      {prioritetAlternativer.map((prioritet) => (
                        <option key={prioritet} value={prioritet}>{prioritet}</option>
                      ))}
                    </select>
                    <button 
                      onClick={lagreEndringer} 
                      className="bg-green-500 text-white px-2 py-1 rounded mr-1 text-xs"
                      disabled={lagrer}
                    >
                      {lagrer ? 'Lagrer...' : 'Lagre'}
                    </button>
                    <button 
                      onClick={avbrytRedigering} 
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <p className="text-gray-700">{initiativ.prioritet}</p>
                    <button 
                      onClick={() => startRedigering('prioritet')} 
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-gray-500">Startdato</p>
                {redigererFelt === 'startDato' ? (
                  <div className="flex items-center">
                    <input
                      type="date"
                      name="startDato"
                      value={formaterDatoForInput(redigertInitiativ.startDato || '')}
                      onChange={håndterInputEndring}
                      className="border rounded px-2 py-1 mr-2"
                    />
                    <button 
                      onClick={lagreEndringer} 
                      className="bg-green-500 text-white px-2 py-1 rounded mr-1 text-xs"
                      disabled={lagrer}
                    >
                      {lagrer ? 'Lagrer...' : 'Lagre'}
                    </button>
                    <button 
                      onClick={avbrytRedigering} 
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <p className="text-gray-700">{formaterDato(initiativ.startDato)}</p>
                    <button 
                      onClick={() => startRedigering('startDato')} 
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-gray-500">Forventet sluttdato</p>
                {redigererFelt === 'sluttDato' ? (
                  <div className="flex items-center">
                    <input
                      type="date"
                      name="sluttDato"
                      value={initiativ.sluttDato ? formaterDatoForInput(redigertInitiativ.sluttDato || '') : ''}
                      onChange={håndterInputEndring}
                      className="border rounded px-2 py-1 mr-2"
                    />
                    <button 
                      onClick={lagreEndringer} 
                      className="bg-green-500 text-white px-2 py-1 rounded mr-1 text-xs"
                      disabled={lagrer}
                    >
                      {lagrer ? 'Lagrer...' : 'Lagre'}
                    </button>
                    <button 
                      onClick={avbrytRedigering} 
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <p className="text-gray-700">{initiativ.sluttDato ? formaterDato(initiativ.sluttDato) : 'Ikke satt'}</p>
                    <button 
                      onClick={() => startRedigering('sluttDato')} 
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {initiativ.handlinger && initiativ.handlinger.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Handlinger/Oppfølgingspunkter</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beskrivelse</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ansvarlig</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frist</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {initiativ.handlinger.map((handling) => (
                  <tr key={handling._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{handling.beskrivelse}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{handling.ansvarlig}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{handling.frist ? formaterDato(handling.frist) : 'Ikke satt'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        handling.status === 'Fullført' ? 'bg-green-100 text-green-800' :
                        handling.status === 'Pågår' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {handling.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {viserBusinessCanvas && initiativ && (
        <BusinessCanvas 
          initiativ={initiativ} 
          onClose={() => setViserBusinessCanvas(false)} 
        />
      )}
    </div>
  );
};

export default InitiativDetaljer;