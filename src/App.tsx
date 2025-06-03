import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TransportTracker } from './components/TransportTracker';
import './styles/index.css';

// Usuario de prueba - En producción esto vendría de un sistema de autenticación
const testUser = {
  idcliente: 110,
  name: 'Admin',
  role: 'admin'
};

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'routes':
      case 'stops':
        return <TransportTracker user={testUser} activeSection={activeSection as 'routes' | 'stops'} />;
      default:
        return <div className="pt-20 px-4">Sección en construcción</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      {renderContent()}
    </div>
  );
}

export default App;
