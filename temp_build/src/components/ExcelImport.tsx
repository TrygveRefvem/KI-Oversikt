import React, { useState } from 'react';
import { importInitiativerFromExcel } from '../services/initiativService';

interface ExcelImportProps {
  onImportSuccess: () => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Vennligst velg en Excel-fil først');
      return;
    }
    
    // Sjekk filtype
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'xls' && fileType !== 'xlsx') {
      setError('Kun Excel-filer (.xls, .xlsx) er tillatt');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      const result = await importInitiativerFromExcel(file);
      
      setSuccess(`${result.opprettede.length} initiativer ble importert. ${result.feilet.length} feilet.`);
      setFile(null);
      
      // Nullstill filinput
      const fileInput = document.getElementById('excel-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Informer parent-komponenten om vellykket import
      onImportSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kunne ikke importere Excel-filen. Vennligst prøv igjen.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Importer initiativer fra Excel</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="excel-file" className="block text-sm font-medium text-gray-700 mb-2">
            Velg Excel-fil
          </label>
          <input
            type="file"
            id="excel-file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Filen vil bli analysert med AI for å strukturere dataene
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <button
          type="submit"
          disabled={!file || isUploading}
          className={`btn ${
            !file || isUploading ? 'btn-disabled' : 'btn-primary'
          }`}
        >
          {isUploading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
              Importerer...
            </>
          ) : (
            'Importer initiativer'
          )}
        </button>
      </form>
    </div>
  );
};

export default ExcelImport; 