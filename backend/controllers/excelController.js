const Initiativ = require('../models/Initiativ');
const excelService = require('../services/excelService');

/**
 * Importerer initiativer fra en Excel-fil
 * @param {Object} req - Express request-objekt
 * @param {Object} res - Express response-objekt
 * @param {Function} next - Express next-funksjon
 */
exports.importInitiativerFromExcel = async (req, res, next) => {
  try {
    // Sjekk om fil er lastet opp
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Ingen fil ble lastet opp'
      });
    }
    
    // Parse Excel-filen
    const excelData = excelService.parseExcelFile(req.file.buffer);
    
    if (!excelData || excelData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel-filen inneholder ingen data'
      });
    }
    
    // Analyser Excel-dataene med OpenAI
    const initiativData = await excelService.analyzeExcelData(excelData);
    
    // Opprett initiativer i databasen
    const opprettede = [];
    const feilet = [];
    
    for (const data of initiativData) {
      try {
        // Generer en unik initiativId
        const count = await Initiativ.countDocuments();
        const initiativId = `KI-${(count + 1).toString().padStart(3, '0')}`;
        
        // Opprett initiativ
        const initiativ = await Initiativ.create({
          ...data,
          initiativId
        });
        
        opprettede.push(initiativ);
      } catch (error) {
        console.error('Feil ved oppretting av initiativ:', error);
        feilet.push({
          data,
          feilmelding: error.message
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `${opprettede.length} initiativer ble importert. ${feilet.length} feilet.`,
      data: {
        opprettede,
        feilet
      }
    });
  } catch (error) {
    console.error('Feil ved import av Excel-fil:', error);
    next(error);
  }
}; 