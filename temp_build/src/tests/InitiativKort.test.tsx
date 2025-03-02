import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InitiativKort from '../components/InitiativKort';

// Mock-data for testing
const mockInitiativ = {
  _id: '123',
  initiativId: 'KI-001',
  tittel: 'Test Initiativ',
  beskrivelse: 'Dette er en testbeskrivelse',
  maal: 'Teste komponenten',
  status: 'Ide',
  ansvarlig: 'Test Person',
  prioritet: 'Medium',
  startDato: new Date().toISOString(),
  opprettetDato: new Date().toISOString(),
  sisteOppdatering: new Date().toISOString()
};

// Wrapper-komponent for å gi router-kontekst
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('InitiativKort-komponent', () => {
  test('viser initiativ-informasjon korrekt', () => {
    renderWithRouter(<InitiativKort initiativ={mockInitiativ} />);
    
    // Sjekk at viktig informasjon vises
    expect(screen.getByText(mockInitiativ.tittel)).toBeInTheDocument();
    expect(screen.getByText(mockInitiativ.beskrivelse)).toBeInTheDocument();
    expect(screen.getByText(mockInitiativ.status)).toBeInTheDocument();
    expect(screen.getByText(mockInitiativ.ansvarlig)).toBeInTheDocument();
  });
  
  test('har riktig lenke til detaljsiden', () => {
    renderWithRouter(<InitiativKort initiativ={mockInitiativ} />);
    
    // Finn lenken og sjekk at den peker til riktig sted
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/initiativer/${mockInitiativ._id}`);
  });
  
  test('viser riktig statusfarge basert på status', () => {
    // Test for hver status
    const statuser = [
      { status: 'Ide', farge: 'bg-gray-200' },
      { status: 'Mockup', farge: 'bg-blue-200' },
      { status: 'PoC', farge: 'bg-yellow-200' },
      { status: 'Utvikling', farge: 'bg-orange-200' },
      { status: 'Implementert', farge: 'bg-green-200' },
      { status: 'Avsluttet', farge: 'bg-purple-200' }
    ];
    
    statuser.forEach(({ status, farge }) => {
      const initiativMedStatus = { ...mockInitiativ, status };
      const { container } = renderWithRouter(<InitiativKort initiativ={initiativMedStatus} />);
      
      // Finn statusbadge og sjekk at den har riktig farge
      const statusElement = screen.getByText(status);
      expect(statusElement).toHaveClass(farge);
    });
  });
}); 