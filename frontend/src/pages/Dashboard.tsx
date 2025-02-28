import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InitiativKort from '../components/InitiativKort';
import StatusFilter from '../components/StatusFilter';
import ExcelImport from '../components/ExcelImport';
import { hentAlleInitiativer } from '../services/initiativService';

interface Initiativ {
  _id: string;
  initiativId: string;
  tittel: string;
  beskrivelse: string;
  status: string;
  ansvarlig: string;
  prioritet: string;
  startDato: string;
  sluttDato?: string;
}

// Visningsalternativer for dashboard
type VisningsType = 'kort' | 'kanban' | 'tabell';

const Dashboard: React.FC = () => {
  const [initiativer, setInitiativer] = useState<Initiativ[]>([]);
  const [filtrerteInitiativer, setFiltrerteInitiativer] = useState<Initiativ[]>([]);
  const [laster, setLaster] = useState<boolean>(true);
  const [feil, setFeil] = useState<string | null>(null);
  const [aktivFilter, setAktivFilter] = useState<string | null>(null);
  const [viserImport, setViserImport] = useState<boolean>(false);
  const [visningsType, setVisningsType] = useState<VisningsType>('kort');

  const lastInitiativer = async () => {
    try {
      setLaster(true);
      const data = await hentAlleInitiativer();
      setInitiativer(data);
      setFiltrerteInitiativer(data);
    } catch (error) {
      console.error('Feil ved henting av initiativer:', error);
      setFeil('Kunne ikke laste initiativer. Vennligst prøv igjen senere.');
    } finally {
      setLaster(false);
    }
  };

  useEffect(() => {
    lastInitiativer();
  }, []);

  useEffect(() => {
    if (aktivFilter) {
      setFiltrerteInitiativer(initiativer.filter(initiativ => initiativ.status === aktivFilter));
    } else {
      setFiltrerteInitiativer(initiativer);
    }
  }, [aktivFilter, initiativer]);

  const håndterFilterEndring = (status: string | null) => {
    setAktivFilter(status);
  };

  const toggleImport = () => {
    setViserImport(!viserImport);
  };

  const formaterDato = (datoStreng: string) => {
    const dato = new Date(datoStreng);
    return dato.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Grupperer initiativer etter status for kanban-visning
  const grupperteInitiativer = () => {
    const grupper: Record<string, Initiativ[]> = {};
    
    // Definer rekkefølgen av statuser
    const statusRekkefølge = ['Ide', 'Mockup', 'PoC', 'Utvikling', 'Implementert', 'Avsluttet'];
    
    // Initialiser tomme arrays for hver status
    statusRekkefølge.forEach(status => {
      grupper[status] = [];
    });
    
    // Fyll gruppene med initiativer
    filtrerteInitiativer.forEach(initiativ => {
      if (grupper[initiativ.status]) {
        grupper[initiativ.status].push(initiativ);
      } else {
        // Håndter eventuelle ukjente statuser
        if (!grupper['Annet']) {
          grupper['Annet'] = [];
        }
        grupper['Annet'].push(initiativ);
      }
    });
    
    return grupper;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">KI Initiativer</h1>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <StatusFilter onFilterChange={håndterFilterEndring} aktivFilter={aktivFilter} />
          <div className="flex space-x-2">
            <button
              onClick={() => setVisningsType('kort')}
              className={`px-3 py-2 rounded ${visningsType === 'kort' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Kortvisning
            </button>
            <button
              onClick={() => setVisningsType('kanban')}
              className={`px-3 py-2 rounded ${visningsType === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setVisningsType('tabell')}
              className={`px-3 py-2 rounded ${visningsType === 'tabell' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Tabellvisning
            </button>
          </div>
          <button
            onClick={toggleImport}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
          >
            {viserImport ? 'Skjul import' : 'Importer fra Excel'}
          </button>
        </div>
      </div>

      {viserImport && (
        <div className="mb-8">
          <ExcelImport onImportSuccess={lastInitiativer} />
        </div>
      )}

      {filtrerteInitiativer.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Ingen initiativer funnet. {aktivFilter ? `Prøv å endre filter fra "${aktivFilter}".` : ''}</span>
        </div>
      ) : (
        <>
          {/* Kortvisning */}
          {visningsType === 'kort' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtrerteInitiativer.map((initiativ) => (
                <InitiativKort key={initiativ._id} initiativ={initiativ} />
              ))}
            </div>
          )}

          {/* Kanban-visning */}
          {visningsType === 'kanban' && (
            <div className="flex overflow-x-auto pb-4 space-x-4">
              {Object.entries(grupperteInitiativer()).map(([status, statusInitiativer]) => (
                statusInitiativer.length > 0 && (
                  <div key={status} className="flex-shrink-0 w-80">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 flex justify-between items-center">
                        {status} 
                        <span className="bg-gray-200 text-gray-700 text-sm py-1 px-2 rounded-full">
                          {statusInitiativer.length}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {statusInitiativer.map(initiativ => (
                          <div key={initiativ._id} className="bg-white p-3 rounded shadow">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-500">{initiativ.initiativId}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                initiativ.prioritet === 'Høy' ? 'bg-orange-100 text-orange-800' :
                                initiativ.prioritet === 'Kritisk' ? 'bg-red-100 text-red-800' :
                                initiativ.prioritet === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {initiativ.prioritet}
                              </span>
                            </div>
                            <h4 className="font-medium mb-1">{initiativ.tittel}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{initiativ.beskrivelse}</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{initiativ.ansvarlig}</span>
                              <span>{formaterDato(initiativ.startDato)}</span>
                            </div>
                            <a 
                              href={`/initiativer/${initiativ._id}`} 
                              className="block mt-2 text-center text-sm text-blue-500 hover:text-blue-700"
                            >
                              Se detaljer
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Tabellvisning */}
          {visningsType === 'tabell' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tittel</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioritet</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ansvarlig</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startdato</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtrerteInitiativer.map((initiativ) => (
                    <tr key={initiativ._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{initiativ.initiativId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{initiativ.tittel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          initiativ.status === 'Ide' ? 'bg-gray-100 text-gray-800' :
                          initiativ.status === 'Mockup' ? 'bg-blue-100 text-blue-800' :
                          initiativ.status === 'PoC' ? 'bg-purple-100 text-purple-800' :
                          initiativ.status === 'Utvikling' ? 'bg-yellow-100 text-yellow-800' :
                          initiativ.status === 'Implementert' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {initiativ.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          initiativ.prioritet === 'Høy' ? 'bg-orange-100 text-orange-800' :
                          initiativ.prioritet === 'Kritisk' ? 'bg-red-100 text-red-800' :
                          initiativ.prioritet === 'Medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {initiativ.prioritet}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{initiativ.ansvarlig}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formaterDato(initiativ.startDato)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href={`/initiativer/${initiativ._id}`} className="text-blue-600 hover:text-blue-900">
                          Se detaljer
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard; 