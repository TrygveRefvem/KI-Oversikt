const express = require('express');
const router = express.Router();
const initiativController = require('../controllers/initiativController');
const excelController = require('../controllers/excelController');
const { upload, handleUploadErrors } = require('../middleware/upload');

// Hent alle initiativer
router.get('/', initiativController.getAllInitiativer);

// Dialogbasert oppretting av initiativ
router.post('/dialog', initiativController.createInitiativFromDialog);

// Import av initiativer fra Excel
router.post('/import-excel', upload.single('excelFile'), handleUploadErrors, excelController.importInitiativerFromExcel);

// Hent et spesifikt initiativ
router.get('/:id', initiativController.getInitiativById);

// Opprett nytt initiativ
router.post('/', initiativController.createInitiativ);

// Oppdater et initiativ
router.put('/:id', initiativController.updateInitiativ);

// Slett et initiativ
router.delete('/:id', initiativController.deleteInitiativ);

// Oppdater status for et initiativ
router.patch('/:id/status', initiativController.updateInitiativStatus);

// Legg til handling/oppfølgingspunkt
router.post('/:id/handlinger', initiativController.addHandling);

// Oppdater handling/oppfølgingspunkt
router.put('/:id/handlinger/:handlingId', initiativController.updateHandling);

// Legg til vedlegg/lenke
router.post('/:id/vedlegg', initiativController.addVedlegg);

module.exports = router; 