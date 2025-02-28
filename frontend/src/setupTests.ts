// jest-dom legger til egendefinerte matchers for å teste DOM-elementer
import '@testing-library/jest-dom';

// Globale oppsett for tester
beforeAll(() => {
  // Deaktiver console.error under tester for å unngå støy i testutskriften
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Deaktiver console.warn under tester
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  // Gjenopprett console.error og console.warn etter alle tester
  jest.restoreAllMocks();
});