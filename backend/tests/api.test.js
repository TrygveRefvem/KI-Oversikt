const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const initiativRoutes = require('../routes/initiativRoutes');
const Initiativ = require('../models/Initiativ');

// Oppsett av testapp
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/initiativer', initiativRoutes);

// Feilhåndtering
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Serverfeil',
    error: err.message
  });
});

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

describe('API Endepunkter', () => {
  describe('GET /api/initiativer', () => {
    it('skal returnere en tom liste når det ikke finnes initiativer', async () => {
      const res = await request(app).get('/api/initiativer');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
    
    it('skal returnere alle initiativer', async () => {
      // Opprett testdata
      await Initiativ.create([
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
      ]);
      
      const res = await request(app).get('/api/initiativer');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].tittel).toBe('Test Initiativ 1');
      expect(res.body.data[1].tittel).toBe('Test Initiativ 2');
    });
  });
  
  describe('GET /api/initiativer/:id', () => {
    it('skal returnere et initiativ basert på ID', async () => {
      // Opprett testdata
      const initiativ = await Initiativ.create({
        initiativId: 'KI-001',
        tittel: 'Test Initiativ',
        beskrivelse: 'Beskrivelse',
        maal: 'Mål',
        ansvarlig: 'Person'
      });
      
      const res = await request(app).get(`/api/initiativer/${initiativ._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tittel).toBe('Test Initiativ');
      expect(res.body.data.initiativId).toBe('KI-001');
    });
    
    it('skal returnere 404 når initiativet ikke finnes', async () => {
      const res = await request(app).get(`/api/initiativer/${new mongoose.Types.ObjectId()}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Initiativ ikke funnet');
    });
  });
  
  describe('POST /api/initiativer', () => {
    it('skal opprette et nytt initiativ', async () => {
      const initiativData = {
        tittel: 'Nytt Initiativ',
        beskrivelse: 'Beskrivelse',
        maal: 'Mål',
        ansvarlig: 'Person',
        initiativId: 'KI-999' // Legg til initiativId for å unngå validering
      };
      
      const res = await request(app)
        .post('/api/initiativer')
        .send(initiativData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tittel).toBe('Nytt Initiativ');
      expect(res.body.data.initiativId).toBe('KI-999');
      
      // Sjekk at initiativet faktisk ble lagret i databasen
      const savedInitiativ = await Initiativ.findOne({ tittel: 'Nytt Initiativ' });
      expect(savedInitiativ).not.toBeNull();
    });
    
    it('skal validere påkrevde felter', async () => {
      const res = await request(app)
        .post('/api/initiativer')
        .send({});
      
      expect(res.statusCode).toBe(500); // Mongoose-valideringsfeil
      expect(res.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/initiativer/:id', () => {
    it('skal oppdatere et initiativ', async () => {
      // Opprett testdata
      const initiativ = await Initiativ.create({
        initiativId: 'KI-001',
        tittel: 'Test Initiativ',
        beskrivelse: 'Beskrivelse',
        maal: 'Mål',
        ansvarlig: 'Person'
      });
      
      const oppdatertData = {
        tittel: 'Oppdatert Tittel',
        beskrivelse: 'Oppdatert Beskrivelse'
      };
      
      const res = await request(app)
        .put(`/api/initiativer/${initiativ._id}`)
        .send(oppdatertData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tittel).toBe('Oppdatert Tittel');
      expect(res.body.data.beskrivelse).toBe('Oppdatert Beskrivelse');
      expect(res.body.data.maal).toBe('Mål'); // Uendret felt
      
      // Sjekk at initiativet faktisk ble oppdatert i databasen
      const oppdatertInitiativ = await Initiativ.findById(initiativ._id);
      expect(oppdatertInitiativ.tittel).toBe('Oppdatert Tittel');
    });
  });
  
  describe('DELETE /api/initiativer/:id', () => {
    it('skal slette et initiativ', async () => {
      // Opprett testdata
      const initiativ = await Initiativ.create({
        initiativId: 'KI-001',
        tittel: 'Test Initiativ',
        beskrivelse: 'Beskrivelse',
        maal: 'Mål',
        ansvarlig: 'Person'
      });
      
      const res = await request(app).delete(`/api/initiativer/${initiativ._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Sjekk at initiativet faktisk ble slettet fra databasen
      const slettetInitiativ = await Initiativ.findById(initiativ._id);
      expect(slettetInitiativ).toBeNull();
    });
  });
}); 