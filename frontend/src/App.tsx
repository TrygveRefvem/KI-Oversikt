import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InitiativDetaljer from './pages/InitiativDetaljer';
import NyttInitiativ from './pages/NyttInitiativ';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="initiativer/ny" element={<NyttInitiativ />} />
        <Route path="initiativer/:id" element={<InitiativDetaljer />} />
      </Route>
    </Routes>
  );
};

export default App; 