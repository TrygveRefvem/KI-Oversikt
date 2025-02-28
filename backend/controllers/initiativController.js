const Initiativ = require('../models/Initiativ');
const openaiService = require('../services/openaiService');

// Hent alle initiativer
exports.getAllInitiativer = async (req, res, next) => {
  try {
    const initiativer = await Initiativ.find().sort({ opprettetDato: -1 });
    res.status(200).json({
      success: true,
      count: initiativer.length,
      data: initiativer
    });
  } catch (error) {
    next(error);
  }
};

// Hent et spesifikt initiativ
exports.getInitiativById = async (req, res, next) => {
  try {
    const initiativ = await Initiativ.findById(req.params.id);
    
    if (!initiativ) {
      return res.status(404).json({
        success: false,
        message: 'Initiativ ikke funnet'
      });
    }
    
    res.status(200).json({
      success: true,
      data: initiativ
    });
  } catch (error) {
    next(error);
  }
};

// Opprett nytt initiativ
exports.createInitiativ = async (req, res, next) => {
  try {
    const initiativ = await Initiativ.create(req.body);
    
    res.status(201).json({
      success: true,
      data: initiativ
    });
  } catch (error) {
    next(error);
  }
};

// Oppdater et initiativ
exports.updateInitiativ = async (req, res, next) => {
  try {
    const initiativ = await Initiativ.findByIdAndUpdate(
      req.params.id,
      { ...req.body, sisteOppdatering: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!initiativ) {
      return res.status(404).json({
        success: false,
        message: 'Initiativ ikke funnet'
      });
    }
    
    res.status(200).json({
      success: true,
      data: initiativ
    });
  } catch (error) {
    next(error);
  }
};

// Slett et initiativ
exports.deleteInitiativ = async (req, res, next) => {
  try {
    const initiativ = await Initiativ.findByIdAndDelete(req.params.id);
    
    if (!initiativ) {
      return res.status(404).json({
        success: false,
        message: 'Initiativ ikke funnet'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Dialogbasert oppretting av initiativ
exports.createInitiativFromDialog = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Meldingsinnhold er påkrevd'
      });
    }
    
    // Bruk OpenAI for å tolke brukerens melding og generere strukturert data
    const initiativData = await openaiService.processInitiativDialog(message);
    
    // Generer en unik initiativId
    const count = await Initiativ.countDocuments();
    const initiativId = `KI-${(count + 1).toString().padStart(3, '0')}`;
    
    // Opprett initiativ basert på strukturert data
    const initiativ = await Initiativ.create({
      ...initiativData,
      initiativId
    });
    
    res.status(201).json({
      success: true,
      data: initiativ,
      aiResponse: initiativData.aiResponse || 'Initiativ opprettet basert på dialog'
    });
  } catch (error) {
    next(error);
  }
};

// Oppdater status for et initiativ
exports.updateInitiativStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status er påkrevd'
      });
    }
    
    const initiativ = await Initiativ.findByIdAndUpdate(
      req.params.id,
      { status, sisteOppdatering: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!initiativ) {
      return res.status(404).json({
        success: false,
        message: 'Initiativ ikke funnet'
      });
    }
    
    res.status(200).json({
      success: true,
      data: initiativ
    });
  } catch (error) {
    next(error);
  }
};

// Legg til handling/oppfølgingspunkt
exports.addHandling = async (req, res, next) => {
  try {
    const initiativ = await Initiativ.findById(req.params.id);
    
    if (!initiativ) {
      return res.status(404).json({
        success: false,
        message: 'Initiativ ikke funnet'
      });
    }
    
    initiativ.handlinger.push(req.body);
    initiativ.sisteOppdatering = Date.now();
    
    await initiativ.save();
    
    res.status(200).json({
      success: true,
      data: initiativ
    });
  } catch (error) {
    next(error);
  }
};

// Oppdater handling/oppfølgingspunkt
exports.updateHandling = async (req, res, next) => {
  try {
    const initiativ = await Initiativ.findById(req.params.id);
    
    if (!initiativ) {
      return res.status(404).json({
        success: false,
        message: 'Initiativ ikke funnet'
      });
    }
    
    // Finn indeksen til handlingen som skal oppdateres
    const handlingIndex = initiativ.handlinger.findIndex(
      h => h._id.toString() === req.params.handlingId
    );
    
    if (handlingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Handling ikke funnet'
      });
    }
    
    // Oppdater handlingen
    initiativ.handlinger[handlingIndex] = {
      ...initiativ.handlinger[handlingIndex].toObject(),
      ...req.body
    };
    
    initiativ.sisteOppdatering = Date.now();
    
    await initiativ.save();
    
    res.status(200).json({
      success: true,
      data: initiativ
    });
  } catch (error) {
    next(error);
  }
};

// Legg til vedlegg/lenke
exports.addVedlegg = async (req, res, next) => {
  try {
    const initiativ = await Initiativ.findById(req.params.id);
    
    if (!initiativ) {
      return res.status(404).json({
        success: false,
        message: 'Initiativ ikke funnet'
      });
    }
    
    initiativ.vedlegg.push(req.body);
    initiativ.sisteOppdatering = Date.now();
    
    await initiativ.save();
    
    res.status(200).json({
      success: true,
      data: initiativ
    });
  } catch (error) {
    next(error);
  }
}; 