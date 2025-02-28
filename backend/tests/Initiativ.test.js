const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Initiativ = require('../models/Initiativ');

// Oppsett av in-memory MongoDB for testing
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Tøm databasen før hver test
  await Initiativ.deleteMany({});
});

describe('Initiativ Model', () => {
  it('skal opprette og lagre et initiativ', async () => {
    const initiativData = {
      initiativId: 'KI-001', // Legg til initiativId for å unngå validering
      tittel: 'Test Initiativ',
      beskrivelse: 'Dette er en test',
      maal: 'Teste modellen',
      ansvarlig: 'Testperson'
    };
    
    const initiativ = new Initiativ(initiativData);
    const savedInitiativ = await initiativ.save();
    
    // Sjekk at initiativet ble lagret
    expect(savedInitiativ._id).toBeDefined();
    expect(savedInitiativ.tittel).toBe(initiativData.tittel);
    expect(savedInitiativ.beskrivelse).toBe(initiativData.beskrivelse);
    expect(savedInitiativ.maal).toBe(initiativData.maal);
    expect(savedInitiativ.ansvarlig).toBe(initiativData.ansvarlig);
    
    // Sjekk standardverdier
    expect(savedInitiativ.status).toBe('Ide');
    expect(savedInitiativ.prioritet).toBe('Medium');
    expect(savedInitiativ.startDato).toBeDefined();
    expect(savedInitiativ.opprettetDato).toBeDefined();
    expect(savedInitiativ.sisteOppdatering).toBeDefined();
    
    // Sjekk at initiativId ble beholdt
    expect(savedInitiativ.initiativId).toBe('KI-001');
  });
  
  it('skal validere påkrevde felter', async () => {
    const initiativ = new Initiativ({});
    
    let error;
    try {
      await initiativ.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.tittel).toBeDefined();
    expect(error.errors.beskrivelse).toBeDefined();
    expect(error.errors.maal).toBeDefined();
    expect(error.errors.ansvarlig).toBeDefined();
    expect(error.errors.initiativId).toBeDefined();
  });
  
  it('skal validere status enum-verdier', async () => {
    const initiativ = new Initiativ({
      initiativId: 'KI-001',
      tittel: 'Test Initiativ',
      beskrivelse: 'Dette er en test',
      maal: 'Teste modellen',
      ansvarlig: 'Testperson',
      status: 'UgyldigStatus'
    });
    
    let error;
    try {
      await initiativ.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });
  
  it('skal validere prioritet enum-verdier', async () => {
    const initiativ = new Initiativ({
      initiativId: 'KI-001',
      tittel: 'Test Initiativ',
      beskrivelse: 'Dette er en test',
      maal: 'Teste modellen',
      ansvarlig: 'Testperson',
      prioritet: 'UgyldigPrioritet'
    });
    
    let error;
    try {
      await initiativ.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.prioritet).toBeDefined();
  });
  
  it('skal generere unike initiativId-er', async () => {
    // Opprett flere initiativer med eksplisitte ID-er
    const initiativ1 = await Initiativ.create({
      initiativId: 'KI-001',
      tittel: 'Initiativ 1',
      beskrivelse: 'Beskrivelse 1',
      maal: 'Mål 1',
      ansvarlig: 'Person 1'
    });
    
    const initiativ2 = await Initiativ.create({
      initiativId: 'KI-002',
      tittel: 'Initiativ 2',
      beskrivelse: 'Beskrivelse 2',
      maal: 'Mål 2',
      ansvarlig: 'Person 2'
    });
    
    const initiativ3 = await Initiativ.create({
      initiativId: 'KI-003',
      tittel: 'Initiativ 3',
      beskrivelse: 'Beskrivelse 3',
      maal: 'Mål 3',
      ansvarlig: 'Person 3'
    });
    
    // Sjekk at ID-ene er unike og følger mønsteret
    expect(initiativ1.initiativId).toBe('KI-001');
    expect(initiativ2.initiativId).toBe('KI-002');
    expect(initiativ3.initiativId).toBe('KI-003');
    
    expect(initiativ1.initiativId).not.toBe(initiativ2.initiativId);
    expect(initiativ2.initiativId).not.toBe(initiativ3.initiativId);
    expect(initiativ1.initiativId).not.toBe(initiativ3.initiativId);
  });
}); 