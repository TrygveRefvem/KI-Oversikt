const xlsx = require('xlsx');
const openaiService = require('./openaiService');

/**
 * Leser en Excel-fil og konverterer den til JSON
 * @param {Buffer} fileBuffer - Buffer med Excel-fildata
 * @returns {Array} Array med objekter fra Excel-filen
 */
const parseExcelFile = (fileBuffer) => {
  try {
    // Les Excel-filen fra buffer
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    
    // Sjekk om "KI initiativ_master" arket eksisterer
    const targetSheetName = workbook.SheetNames.includes('KI initiativ_master') 
      ? 'KI initiativ_master' 
      : workbook.SheetNames[0];
    
    console.log(`Bruker ark: ${targetSheetName}`);
    const worksheet = workbook.Sheets[targetSheetName];
    
    // Konverter til JSON
    const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    
    // Fjern første rad hvis den bare inneholder kolonneoverskrifter
    const data = rawData.length > 0 && Object.values(rawData[0]).every(val => val === '') 
      ? rawData.slice(1) 
      : rawData;
    
    // Logg dataene for debugging
    console.log('Parsed Excel data:', JSON.stringify(data.slice(0, 2), null, 2));
    console.log(`Totalt antall rader: ${data.length}`);
    
    return data;
  } catch (error) {
    console.error('Feil ved parsing av Excel-fil:', error);
    throw new Error('Kunne ikke lese Excel-filen. Kontroller at formatet er korrekt.');
  }
};

/**
 * Analyserer Excel-data med OpenAI for å strukturere det til initiativ-format
 * @param {Array} excelData - Array med objekter fra Excel-filen
 * @returns {Array} Array med strukturerte initiativ-objekter
 */
const analyzeExcelData = async (excelData) => {
  try {
    // Forbered data for OpenAI-analyse
    const dataForAnalysis = JSON.stringify(excelData, null, 2);
    
    // Forsøk å tolke dataene direkte først
    const structuredData = [];
    
    // Gå gjennom Excel-dataene og forsøk å mappe dem direkte
    for (const row of excelData) {
      console.log('Processing Excel row:', row);
      
      // Sjekk om raden har et navn på initiativet
      if (!row['Navn. Område, prosjekt, produkt']) {
        console.log('Hopper over rad uten navn på initiativ');
        continue;
      }
      
      // Mappe feltene direkte fra Excel-strukturen
      const initiativ = {
        tittel: row['Navn. Område, prosjekt, produkt'] || 'Ukjent initiativ',
        beskrivelse: row['Beskrivelse'] || 'Ingen beskrivelse tilgjengelig',
        maal: row['Målsetning for forretning'] || `Målet med initiativet er å ${row['Navn. Område, prosjekt, produkt'].toLowerCase()}.`,
        status: mapStatus(row['__EMPTY_1'] || row['Status'] || row['Detaljert status']),
        ansvarlig: row['Eier'] || row['Ansvarlig/deltagere'] || row['Divisjon'] || 'Ikke tildelt',
        prioritet: 'Medium', // Standard prioritet siden det ikke er spesifisert i Excel
        startDato: parseDate(row['Tidsrom'] || row['Fra']),
        sluttDato: parseDate(row['__EMPTY_2'] || row['Til'])
      };
      
      // Legg til strukturert initiativ
      structuredData.push(initiativ);
    }
    
    // Hvis vi klarte å strukturere dataene direkte, returner dem
    if (structuredData.length > 0) {
      console.log(`Strukturerte ${structuredData.length} initiativer direkte fra Excel`);
      console.log('Første initiativ:', structuredData[0]);
      return structuredData;
    }
    
    // Hvis direkte strukturering ikke fungerte, bruk OpenAI
    console.log('Direct structuring failed, using OpenAI');
    
    // Lag en prompt som forklarer hva vi ønsker
    const prompt = `
      Analyser følgende data fra en Excel-fil og konverter det til strukturerte KI-initiativ-objekter.
      
      Excel-filen har følgende struktur:
      - "Navn. Område, prosjekt, produkt" inneholder tittelen på initiativet
      - "Beskrivelse" inneholder en beskrivelse av initiativet
      - "Målsetning for forretning" inneholder målet med initiativet
      - "Status" eller "Detaljert status" inneholder status (Pågår, Avsluttet, etc.)
      - "Eier" eller "Ansvarlig/deltagere" inneholder ansvarlig person/gruppe
      - "Tidsrom" eller "Fra" inneholder startdato
      - "Til" inneholder sluttdato
      
      Hvert initiativ skal ha følgende struktur:
      {
        "tittel": "Tittel på initiativet (fra 'Navn. Område, prosjekt, produkt')",
        "beskrivelse": "Detaljert beskrivelse av initiativet (fra 'Beskrivelse')",
        "maal": "Målsetting for initiativet (fra 'Målsetning for forretning')",
        "status": "Ide/Mockup/PoC/Utvikling/Implementert/Avsluttet (basert på 'Status' eller 'Detaljert status')",
        "ansvarlig": "Navn på ansvarlig person (fra 'Eier' eller 'Ansvarlig/deltagere')",
        "prioritet": "Lav/Medium/Høy/Kritisk (standard er Medium)",
        "startDato": "YYYY-MM-DD" (bruk faktisk dato i dette formatet, IKKE bruk "YYYY-MM-DD" som tekst),
        "sluttDato": "YYYY-MM-DD" (valgfritt, kan være null, bruk faktisk dato i dette formatet)
      }
      
      Hvis noen felt mangler i Excel-dataene, bruk din beste vurdering til å fylle dem ut basert på tilgjengelig informasjon.
      Returner et JSON-array med alle initiativene.
      
      Excel-data:
      ${dataForAnalysis}
    `;
    
    // Send til OpenAI for analyse
    const response = await openaiService.analyzeExcelData(prompt);
    
    return response;
  } catch (error) {
    console.error('Feil ved analyse av Excel-data:', error);
    throw new Error('Kunne ikke analysere Excel-dataene. Prøv igjen senere.');
  }
};

// Hjelpefunksjon for å mappe status-verdier
function mapStatus(value) {
  if (!value) return 'Ide';
  
  const statusLower = value.toLowerCase();
  
  // Spesifikke mappinger fra Excel-filen
  if (statusLower.includes('pågår')) return 'Utvikling';
  if (statusLower.includes('avsluttet')) return 'Avsluttet';
  if (statusLower.includes('oppstart')) return 'Ide';
  if (statusLower.includes('forstudie')) return 'PoC';
  
  // Generelle mappinger
  if (statusLower.includes('ide') || statusLower.includes('idé')) return 'Ide';
  if (statusLower.includes('mock')) return 'Mockup';
  if (statusLower.includes('poc') || statusLower.includes('proof')) return 'PoC';
  if (statusLower.includes('utvik')) return 'Utvikling';
  if (statusLower.includes('impl')) return 'Implementert';
  if (statusLower.includes('avsl')) return 'Avsluttet';
  
  return 'Ide';
}

// Hjelpefunksjon for å mappe prioritet-verdier
function mapPriority(value) {
  if (!value) return 'Medium';
  
  const priorityLower = value.toLowerCase();
  if (priorityLower.includes('lav') || priorityLower.includes('low')) return 'Lav';
  if (priorityLower.includes('med') || priorityLower.includes('middle')) return 'Medium';
  if (priorityLower.includes('høy') || priorityLower.includes('high')) return 'Høy';
  if (priorityLower.includes('krit') || priorityLower.includes('critical')) return 'Kritisk';
  
  return 'Medium';
}

// Hjelpefunksjon for å parse datoer
function parseDate(value) {
  if (!value) return null;
  
  // Hvis det er en streng
  if (typeof value === 'string') {
    // Fjern eventuelle mellomrom
    value = value.trim();
    
    // Hvis det er tomt, returner null
    if (!value) return null;
    
    // Prøv å konvertere fra norsk datoformat (DD.MM.YYYY)
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts.length === 3) {
        const year = parts[2].padStart(4, '20'); // Antar 20xx hvis bare to siffer
        const month = parts[1].padStart(2, '0');
        const day = parts[0].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    // Prøv å konvertere fra år-måned format (YYYYMM)
    if (/^\d{6}$/.test(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      return `${year}-${month}-01`; // Sett dag til 1
    }
    
    // Prøv å konvertere fra år format (YYYY)
    if (/^\d{4}$/.test(value)) {
      return `${value}-01-01`; // Sett måned og dag til 1. januar
    }
    
    // Prøv å konvertere fra ISO-format
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString().split('T')[0];
    }
  }
  
  // Hvis det er en Excel-dato (tall)
  if (typeof value === 'number') {
    // Hvis det er et årstall (f.eks. 2024)
    if (value >= 1900 && value <= 2100) {
      return `${value}-01-01`; // Sett måned og dag til 1. januar
    }
    
    // Hvis det er et år-måned format (f.eks. 202401)
    if (value >= 190001 && value <= 210012) {
      const valueStr = value.toString();
      if (valueStr.length === 6) {
        const year = valueStr.substring(0, 4);
        const month = valueStr.substring(4, 6);
        return `${year}-${month}-01`; // Sett dag til 1
      }
    }
    
    // Excel-datoer er antall dager siden 1. januar 1900
    // Konverter til JavaScript-dato
    const excelEpoch = new Date(1899, 11, 30); // 30. desember 1899
    const jsDate = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return jsDate.toISOString().split('T')[0];
  }
  
  // Hvis vi ikke kunne parse datoen, returner dagens dato
  return new Date().toISOString().split('T')[0];
}

module.exports = {
  parseExcelFile,
  analyzeExcelData
}; 