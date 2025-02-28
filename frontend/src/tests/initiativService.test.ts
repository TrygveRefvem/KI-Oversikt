import axios from 'axios';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { 
  hentAlleInitiativer, 
  hentInitiativById, 
  opprettInitiativ, 
  oppdaterInitiativ 
} from '../services/initiativService';

// Mock-data for testing
const mockInitiativer = [
  {
    _id: '1',
    initiativId: 'KI-001',
    tittel: 'Test Initiativ 1',
    beskrivelse: 'Beskrivelse 1',
    maal: 'Mål 1',
    status: 'Ide',
    ansvarlig: 'Person 1'
  },
  {
    _id: '2',
    initiativId: 'KI-002',
    tittel: 'Test Initiativ 2',
    beskrivelse: 'Beskrivelse 2',
    maal: 'Mål 2',
    status: 'Utvikling',
    ansvarlig: 'Person 2'
  }
];

// Oppsett av mock-server
const server = setupServer(
  // GET /api/initiativer
  rest.get('/api/initiativer', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        count: mockInitiativer.length,
        data: mockInitiativer
      })
    );
  }),
  
  // GET /api/initiativer/:id
  rest.get('/api/initiativer/:id', (req, res, ctx) => {
    const { id } = req.params;
    const initiativ = mockInitiativer.find(i => i._id === id);
    
    if (!initiativ) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'Initiativ ikke funnet'
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: initiativ
      })
    );
  }),
  
  // POST /api/initiativer
  rest.post('/api/initiativer', async (req, res, ctx) => {
    const initiativ = await req.json();
    const nyInitiativ = {
      _id: '3',
      initiativId: 'KI-003',
      ...initiativ
    };
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: nyInitiativ
      })
    );
  }),
  
  // PUT /api/initiativer/:id
  rest.put('/api/initiativer/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const oppdatering = await req.json();
    const initiativ = mockInitiativer.find(i => i._id === id);
    
    if (!initiativ) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'Initiativ ikke funnet'
        })
      );
    }
    
    const oppdatertInitiativ = {
      ...initiativ,
      ...oppdatering
    };
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: oppdatertInitiativ
      })
    );
  })
);

// Oppsett og nedrigging av mock-server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Initiativ Service', () => {
  test('hentAlleInitiativer henter alle initiativer', async () => {
    const response = await hentAlleInitiativer();
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(2);
    expect(response.data[0].tittel).toBe('Test Initiativ 1');
  });
  
  test('hentInitiativById henter et spesifikt initiativ', async () => {
    const response = await hentInitiativById('1');
    expect(response.success).toBe(true);
    expect(response.data.tittel).toBe('Test Initiativ 1');
  });
  
  test('hentInitiativById returnerer feil når initiativet ikke finnes', async () => {
    try {
      await hentInitiativById('999');
      // Hvis vi kommer hit, har ikke funksjonen kastet en feil som forventet
      fail('Forventet at funksjonen skulle kaste en feil');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
  
  test('opprettInitiativ oppretter et nytt initiativ', async () => {
    const nyttInitiativ = {
      tittel: 'Nytt Initiativ',
      beskrivelse: 'Ny beskrivelse',
      maal: 'Nytt mål',
      ansvarlig: 'Ny person'
    };
    
    const response = await opprettInitiativ(nyttInitiativ);
    expect(response.success).toBe(true);
    expect(response.data.tittel).toBe('Nytt Initiativ');
    expect(response.data.initiativId).toBe('KI-003');
  });
  
  test('oppdaterInitiativ oppdaterer et eksisterende initiativ', async () => {
    const oppdatering = {
      tittel: 'Oppdatert Tittel',
      status: 'Implementert'
    };
    
    const response = await oppdaterInitiativ('1', oppdatering);
    expect(response.success).toBe(true);
    expect(response.data.tittel).toBe('Oppdatert Tittel');
    expect(response.data.status).toBe('Implementert');
    expect(response.data.beskrivelse).toBe('Beskrivelse 1'); // Uendret felt
  });
  
  test('håndterer nettverksfeil', async () => {
    // Overstyr axios for å simulere en nettverksfeil
    jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Nettverksfeil'));
    
    try {
      await hentAlleInitiativer();
      fail('Forventet at funksjonen skulle kaste en feil');
    } catch (error: any) {
      expect(error.message).toBe('Nettverksfeil');
    }
  });
}); 