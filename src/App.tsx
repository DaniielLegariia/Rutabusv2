import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TransportTracker } from './components/TransportTracker';
import { FleetManagement } from './components/FleetManagement';
import type { User } from './types/user';
import './styles/index.css';

// Usuario de prueba - En producción esto vendría de un sistema de autenticación
const testUser: User = {
  idcliente: "110",
  idusu: "2369",
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
      case 'fleet':
        return (
          <div className="container mx-auto px-4 py-8 pt-20">
            <FleetManagement idcliente={testUser.idcliente} idusu={testUser.idusu} />
          </div>
        );
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
