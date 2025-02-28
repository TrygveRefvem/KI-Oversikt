import React from 'react';
import { Link } from 'react-router-dom';

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

interface InitiativKortProps {
  initiativ: Initiativ;
}

const statusFarger: Record<string, string> = {
  'Ide': 'bg-gray-100 text-gray-800',
  'Mockup': 'bg-blue-100 text-blue-800',
  'PoC': 'bg-purple-100 text-purple-800',
  'Utvikling': 'bg-yellow-100 text-yellow-800',
  'Implementert': 'bg-green-100 text-green-800',
  'Avsluttet': 'bg-red-100 text-red-800'
};

const prioritetFarger: Record<string, string> = {
  'Lav': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-blue-100 text-blue-800',
  'Høy': 'bg-orange-100 text-orange-800',
  'Kritisk': 'bg-red-100 text-red-800'
};

const InitiativKort: React.FC<InitiativKortProps> = ({ initiativ }) => {
  const {
    _id,
    initiativId,
    tittel,
    beskrivelse,
    status,
    ansvarlig,
    prioritet,
    startDato
  } = initiativ;

  const formaterDato = (datoStreng: string) => {
    const dato = new Date(datoStreng);
    return dato.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-gray-500">{initiativId}</span>
        <div className="flex space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusFarger[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prioritetFarger[prioritet] || 'bg-gray-100 text-gray-800'}`}>
            {prioritet}
          </span>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tittel}</h3>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{beskrivelse}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>Ansvarlig: {ansvarlig}</span>
        <span>Start: {formaterDato(startDato)}</span>
      </div>
      
      <Link
        to={`/initiativer/${_id}`}
        className="btn btn-outline w-full text-center"
      >
        Se detaljer
      </Link>
    </div>
  );
};

export default InitiativKort; 