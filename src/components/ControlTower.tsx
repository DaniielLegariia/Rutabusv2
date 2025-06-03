import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import type { Route } from '../types';

interface ControlTowerProps {
  routes: Route[];
  simulationRunning: boolean;
  simulationTime: Date | null;
  onToggleSimulation: () => void;
  currentView: 'route' | 'unit';
  onViewChange: (view: 'route' | 'unit') => void;
  groupingType: 'destination' | 'origin' | 'none';
  onGroupingChange: (type: 'destination' | 'origin' | 'none') => void;
}

export const ControlTower: React.FC<ControlTowerProps> = ({
  routes,
  simulationRunning,
  simulationTime,
  onToggleSimulation,
  currentView,
  onViewChange,
  groupingType,
  onGroupingChange,
}) => {
  return (
    <header className="bg-white shadow-lg fixed top-16 left-0 right-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Torre de Control - Rutabus</h1>
            <p className="text-gray-600 text-sm">Seguimiento en tiempo real del personal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => onViewChange('route')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === 'route' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Vista Ruta
              </button>
              <button
                onClick={() => onViewChange('unit')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === 'unit' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Vista Unidad
              </button>
            </div>
            <div className="flex gap-2 border-l pl-4">
              <button
                onClick={() => onGroupingChange('destination')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  groupingType === 'destination' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Por Destino
              </button>
              <button
                onClick={() => onGroupingChange('origin')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  groupingType === 'origin' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Por Origen
              </button>
              <button
                onClick={() => onGroupingChange('none')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  groupingType === 'none' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sin Agrupar
              </button>
            </div>
            <button
              onClick={onToggleSimulation}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                simulationRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {simulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {simulationRunning ? 'Pausar' : 'Iniciar'} Simulación
            </button>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">
                {simulationTime ? 
                  simulationTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 
                  '--:--'
                }
              </p>
              <p className="text-sm text-gray-600">
                {simulationRunning ? 'Simulación Activa' : 'Simulación Detenida'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}; 