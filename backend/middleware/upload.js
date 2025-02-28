const multer = require('multer');

// Konfigurer lagring i minnet (ikke på disk)
const storage = multer.memoryStorage();

// Filtrer filer for å kun akseptere Excel-filer
const fileFilter = (req, file, cb) => {
  // Logg MIME-type for debugging
  console.log('Filnavn:', file.originalname);
  console.log('MIME-type:', file.mimetype);
  
  // Sjekk MIME-type med flere alternativer
  if (
    file.mimetype === 'application/vnd.ms-excel' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/octet-stream' ||
    /excel|spreadsheet|xlsx|xls/i.test(file.mimetype) ||
    file.originalname.match(/\.(xlsx|xls)$/i)
  ) {
    console.log('Fil akseptert');
    cb(null, true);
  } else {
    console.log('Fil avvist');
    cb(new Error('Kun Excel-filer er tillatt (.xls, .xlsx)'), false);
  }
};

// Konfigurer multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maksimal filstørrelse
  }
});

// Middleware for å håndtere feil fra multer
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-spesifikke feil
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Filen er for stor. Maksimal størrelse er 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Feil ved opplasting: ${err.message}`
    });
  } else if (err) {
    // Andre feil
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  upload,
  handleUploadErrors
}; 