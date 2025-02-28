const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const initiativController = require('../controllers/initiativController');
const Initiativ = require('../models/Initiativ');

// Mock for req, res og next
const mockRequest = (params = {}, body = {}) => ({
  params,
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

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

describe('Initiativ Controller', () => {
  describe('getAllInitiativer', () => {
    it('skal returnere en tom liste når det ikke finnes initiativer', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      await initiativController.getAllInitiativer(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });
    
    it('skal returnere alle initiativer', async () => {
      // Opprett testdata
      const testInitiativer = [
        {
          initiativId: 'KI-001',
          tittel: 'Test Initiativ 1',
          beskrivelse: 'Beskrivelse 1',
          maal: 'Mål 1',
          ansvarlig: 'Person 1'
        },
        {
          initiativId: 'KI-002',
          tittel: 'Test Initiativ 2',
          beskrivelse: 'Beskrivelse 2',
          maal: 'Mål 2',
          ansvarlig: 'Person 2'
        }
      ];
      
      await Initiativ.create(testInitiativer);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await initiativController.getAllInitiativer(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.count).toBe(2);
      expect(responseData.data.length).toBe(2);
    });
    
    it('skal håndtere feil', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      // Mock Initiativ.find for å kaste en feil
      jest.spyOn(Initiativ, 'find').mockImplementationOnce(() => {
        throw new Error('Databasefeil');
      });
      
      await initiativController.getAllInitiativer(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(mockNext.mock.calls[0][0].message).toBe('Databasefeil');
    });
  });
  
  describe('getInitiativById', () => {
    it('skal returnere et initiativ basert på ID', async () => {
      // Opprett testdata
      const testInitiativ = await Initiativ.create({
        initiativId: 'KI-001',
        tittel: 'Test Initiativ',
        beskrivelse: 'Beskrivelse',
        maal: 'Mål',
        ansvarlig: 'Person'
      });
      
      const req = mockRequest({ id: testInitiativ._id });
      const res = mockResponse();
      
      await initiativController.getInitiativById(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.tittel).toBe('Test Initiativ');
    });
    
    it('skal returnere 404 når initiativet ikke finnes', async () => {
      const req = mockRequest({ id: new mongoose.Types.ObjectId() });
      const res = mockResponse();
      
      await initiativController.getInitiativById(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Initiativ ikke funnet'
      });
    });
  });
  
  describe('createInitiativ', () => {
    it('skal opprette et nytt initiativ', async () => {
      const initiativData = {
        tittel: 'Nytt Initiativ',
        beskrivelse: 'Beskrivelse',
        maal: 'Mål',
        ansvarlig: 'Person',
        initiativId: 'KI-999' // Legg til initiativId for å unngå validering
      };
      
      const req = mockRequest({}, initiativData);
      const res = mockResponse();
      
      await initiativController.createInitiativ(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.tittel).toBe('Nytt Initiativ');
      
      // Sjekk at initiativet faktisk ble lagret i databasen
      const savedInitiativ = await Initiativ.findOne({ tittel: 'Nytt Initiativ' });
      expect(savedInitiativ).not.toBeNull();
      expect(savedInitiativ.initiativId).toBe('KI-999');
    });
  });
  
  // Flere tester kan legges til for andre metoder
}); 