import React from 'react';

interface StatusFilterProps {
  aktivFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const statusAlternativer = [
  'Alle',
  'Ide',
  'Mockup',
  'PoC',
  'Utvikling',
  'Implementert',
  'Avsluttet'
];

const StatusFilter: React.FC<StatusFilterProps> = ({ aktivFilter, onFilterChange }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            aktivFilter === null ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Alle
        </button>
        {statusAlternativer.filter(status => status !== 'Alle').map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              aktivFilter === status ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter; 