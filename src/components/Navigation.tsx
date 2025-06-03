import React from 'react';
import { Truck, Radio, BarChart3, Route, UserCheck, Car, History, Settings, MapPin } from 'lucide-react';
import type { NavigationMenuItem } from '../types';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const navigationMenu: NavigationMenuItem[] = [
  { id: 'dashboard', name: 'Torre de Control', icon: Radio, description: 'Monitoreo en tiempo real' },
  { id: 'analytics', name: 'Análisis', icon: BarChart3, description: 'Reportes y estadísticas' },
  { id: 'routes', name: 'Rutas', icon: Route, description: 'Configuración de rutas' },
  { id: 'stops', name: 'Puntos de Control', icon: MapPin, description: 'Gestión de paradas' },
  { id: 'drivers', name: 'Conductores', icon: UserCheck, description: 'Gestión de conductores' },
  { id: 'fleet', name: 'Flota', icon: Car, description: 'Gestión de vehículos' },
  { id: 'history', name: 'Histórico', icon: History, description: 'Registros históricos' },
  { id: 'settings', name: 'Configuración', icon: Settings, description: 'Ajustes del sistema' }
];

export const Navigation: React.FC<NavigationProps> = ({ activeSection, setActiveSection }) => {
  return (
    <nav className="bg-gray-900 text-white shadow-lg fixed top-0 left-0 right-0 z-[110]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Truck className="w-8 h-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">Rutabus</span>
            </div>
            <div className="ml-10 flex items-baseline space-x-1">
              {navigationMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                      activeSection === item.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Usuario: Admin</p>
              <p className="text-xs text-gray-500">Rutabus Activo</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}; 