import axios from 'axios';

const API_URL = 'https://kioversikt-api.azurewebsites.net/api/initiativer';

/**
 * Henter alle initiativer
 * @returns {Promise<Array>} Array med initiativer
 */
export const hentAlleInitiativer = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data;
  } catch (error: any) {
    console.error('Feil ved henting av initiativer:', error);
    throw new Error(error.response?.data?.message || 'Kunne ikke hente initiativer');
  }
};

/**
 * Henter et spesifikt initiativ basert på ID
 * @param {string} id - Initiativ-ID
 * @returns {Promise<Object>} Initiativ-objekt
 */
export const hentInitiativById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Feil ved henting av initiativ med ID ${id}:`, error);
    throw error;
  }
};

/**
 * Oppretter et nytt initiativ
 * @param {Object} initiativData - Data for det nye initiativet
 * @returns {Promise<Object>} Det opprettede initiativet
 */
export const opprettInitiativ = async (initiativData: any) => {
  try {
    const response = await axios.post(API_URL, initiativData);
    return response.data.data;
  } catch (error) {
    console.error('Feil ved oppretting av initiativ:', error);
    throw error;
  }
};

/**
 * Oppretter et initiativ basert på dialog
 * @param {string} message - Brukerens melding
 * @returns {Promise<Object>} Respons med initiativdata eller AI-respons
 */
export const opprettInitiativFraDialog = async (message: string) => {
  try {
    const response = await axios.post(`${API_URL}/dialog`, { message });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Noe gikk galt');
    }
    return response.data.data;
  } catch (error: any) {
    console.error('Feil ved oppretting av initiativ fra dialog:', error);
    throw new Error(error.response?.data?.message || 'Kunne ikke opprette initiativ. Vennligst prøv igjen.');
  }
};

/**
 * Oppdaterer et initiativ
 * @param {string} id - Initiativ-ID
 * @param {Object} initiativData - Oppdatert initiativdata
 * @returns {Promise<Object>} Det oppdaterte initiativet
 */
export const oppdaterInitiativ = async (id: string, initiativData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, initiativData);
    return response.data.data;
  } catch (error) {
    console.error(`Feil ved oppdatering av initiativ med ID ${id}:`, error);
    throw error;
  }
};

/**
 * Oppdaterer status for et initiativ
 * @param {string} id - Initiativ-ID
 * @param {string} status - Ny status
 * @returns {Promise<Object>} Det oppdaterte initiativet
 */
export const oppdaterInitiativStatus = async (id: string, status: string) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data.data;
  } catch (error) {
    console.error(`Feil ved oppdatering av status for initiativ med ID ${id}:`, error);
    throw error;
  }
};

/**
 * Legger til en handling/oppfølgingspunkt for et initiativ
 * @param {string} id - Initiativ-ID
 * @param {Object} handlingData - Data for handlingen
 * @returns {Promise<Object>} Det oppdaterte initiativet
 */
export const leggTilHandling = async (id: string, handlingData: any) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/handlinger`, handlingData);
    return response.data.data;
  } catch (error) {
    console.error(`Feil ved tillegging av handling for initiativ med ID ${id}:`, error);
    throw error;
  }
};

/**
 * Oppdaterer en handling/oppfølgingspunkt for et initiativ
 * @param {string} id - Initiativ-ID
 * @param {string} handlingId - Handling-ID
 * @param {Object} handlingData - Oppdatert handlingsdata
 * @returns {Promise<Object>} Det oppdaterte initiativet
 */
export const oppdaterHandling = async (id: string, handlingId: string, handlingData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/handlinger/${handlingId}`, handlingData);
    return response.data.data;
  } catch (error) {
    console.error(`Feil ved oppdatering av handling med ID ${handlingId}:`, error);
    throw error;
  }
};

/**
 * Legger til et vedlegg/lenke for et initiativ
 * @param {string} id - Initiativ-ID
 * @param {Object} vedleggData - Data for vedlegget
 * @returns {Promise<Object>} Det oppdaterte initiativet
 */
export const leggTilVedlegg = async (id: string, vedleggData: any) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/vedlegg`, vedleggData);
    return response.data.data;
  } catch (error) {
    console.error(`Feil ved tillegging av vedlegg for initiativ med ID ${id}:`, error);
    throw error;
  }
};

/**
 * Sletter et initiativ
 * @param {string} id - Initiativ-ID
 * @returns {Promise<Object>} Respons fra API
 */
export const slettInitiativ = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Feil ved sletting av initiativ med ID ${id}:`, error);
    throw error;
  }
};

/**
 * Importerer initiativer fra en Excel-fil
 * @param {File} file - Excel-filen som skal importeres
 * @returns {Promise<Object>} Resultatet av importen
 */
export const importInitiativerFromExcel = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('excelFile', file);
    
    const response = await axios.post(`${API_URL}/import-excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Feil ved import av Excel-fil:', error);
    throw error;
  }
}; 