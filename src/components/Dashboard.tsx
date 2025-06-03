import React, { useState, useEffect } from 'react';
import { ControlTower } from './ControlTower';
import { RouteVisualization } from './RouteVisualization';
import { UnitView } from './UnitView';
import { getListRutas, getLastEventUnits } from '../api/Apis.tsx';
import { transformarRutaApiARoute } from '../utils/apiTransform';
import type { Route } from '../types';
import { Loader2 } from 'lucide-react';

interface ApiUnit {
  imei: string;
  short_name: string;
  routeId: string;
  status?: {
    currentStep?: string;
    nextStep?: string;
    routeStatus?: string;
    eta?: string;
    transitionTime?: string;
  };
  delayMinutes?: number;
  stepEtas?: Record<string, string>;
  stepHistory?: Array<{ stepName: string; entryTime: string; exitTime?: string; timeExceeded?: number }>;
  recentEvents?: Array<{ type: string; timestamp: string }>;
}

export const Dashboard: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'route' | 'unit'>('route');
  const [groupingType, setGroupingType] = useState<'destination' | 'origin' | 'none'>('destination');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState<Date | null>(null);
  const idcliente = 110; // Cambia esto según tu lógica

  // Función para agrupar rutas
  const groupRoutes = (routesToGroup: Route[]) => {
    const groups: Record<string, Route[]> = {};
    
    routesToGroup.forEach(route => {
      let key = '';
      if (groupingType === 'destination') {
        key = route.stops[route.stops.length - 1].name;
      } else if (groupingType === 'origin') {
        key = route.stops[0].name;
      } else {
        key = 'all';
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(route);
    });
    
    return groups;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Obtén las rutas
        const rutasData = await getListRutas(idcliente);
        const rutasTransformadas = rutasData.body.routes.map(transformarRutaApiARoute);

        // 2. Obtén las unidades en tiempo real
        const unidadesData = await getLastEventUnits([String(idcliente)]);
        const unidades = unidadesData.body.units as ApiUnit[];

        // 3. Asocia las unidades a sus rutas y paradas correctas usando ShortName
        const rutasConUnidades = rutasTransformadas.map((ruta: Route) => {
          const unidadesDeRuta = unidades.filter(u => u.routeId === String(ruta.id));
          return {
            ...ruta,
            vehicles: unidadesDeRuta.map(unidad => {
              const currentStopId = getStopIdByShortName(ruta, unidad.status?.currentStep);
              const nextStopId = getStopIdByShortName(ruta, unidad.status?.nextStep);
              const position = unidad.status?.nextStep ? 'transit' : 'stop';

              return {
                id: unidad.short_name || unidad.imei,
                imei: unidad.imei,
                driver: '', // Dummy
                capacity: 0, // Dummy
                currentPassengers: 0, // Dummy
                status: unidad.status?.routeStatus || '',
                currentStopId,
                position,
                transitProgress: 0,
                timeSpent: 0,
                targetTime: null,
                nextStopId: nextStopId || undefined,
                finalArrivalTime: unidad.status?.eta ? new Date(unidad.status.eta) : null,
                initialDelay: 0,
                eta: unidad.status?.eta,
                delayMinutes: unidad.delayMinutes,
                stepEtas: unidad.stepEtas,
                stepHistory: unidad.stepHistory,
                recentEvents: unidad.recentEvents,
                transitionTime: unidad.status?.transitionTime,
              };
            }),
          };
        });

        setRoutes(rutasConUnidades);
      } catch (err) {
        console.error('Error al cargar los datos:', err);
        setRoutes([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Busca el idgeo (id de parada) por el ShortName del step actual de la unidad
  function getStopIdByShortName(ruta: Route, shortName: string | undefined) {
    if (!shortName) return 0;
    const stop = ruta.stops.find(s => s.shortName === shortName);
    return stop ? stop.id : 0;
  }

  const handleToggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
    if (!simulationRunning) {
      setSimulationTime(new Date());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando rutas...</h2>
          <p className="text-gray-600">Por favor espere mientras obtenemos la información</p>
        </div>
      </div>
    );
  }

  const routeGroups = groupRoutes(routes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ControlTower
        routes={routes}
        simulationRunning={simulationRunning}
        simulationTime={simulationTime}
        onToggleSimulation={handleToggleSimulation}
        currentView={currentView}
        onViewChange={setCurrentView}
        groupingType={groupingType}
        onGroupingChange={setGroupingType}
      />
      <div className="max-w-7xl mx-auto px-4 py-6 mt-40">
        {currentView === 'route' && (
          <div className="space-y-8">
            {Object.entries(routeGroups).map(([destination, routesInGroup]) => (
              <div key={destination} className="space-y-4">
                {/* Header del grupo */}
                {groupingType !== 'none' && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {groupingType === 'destination' && '🎯 Destino: '}
                          {groupingType === 'origin' && '🚩 Origen: '}
                          {destination}
                        </h2>
                        <p className="text-blue-100">
                          {routesInGroup.length} ruta{routesInGroup.length > 1 ? 's' : ''} • {' '}
                          {routesInGroup.reduce((sum, route) => sum + route.vehicles.length, 0)} vehículo{routesInGroup.reduce((sum, route) => sum + route.vehicles.length, 0) > 1 ? 's' : ''} • {' '}
                          {routesInGroup.reduce((sum, route) => sum + route.vehicles.reduce((vSum, v) => vSum + v.currentPassengers, 0), 0)} pasajeros
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-100">
                          Hora más temprana: {Math.min(...routesInGroup.map(r => r.stops[0].arrivalTime?.getHours() || 0))}:00
                        </p>
                        <p className="text-sm text-blue-100">
                          Capacidad total: {routesInGroup.reduce((sum, route) => sum + route.vehicles.reduce((vSum, v) => vSum + v.capacity, 0), 0)} personas
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Rutas del grupo */}
                <div className={`space-y-6 ${groupingType !== 'none' ? 'ml-4' : ''}`}>
                  {routesInGroup.map(route => (
                    <RouteVisualization
                      key={route.id}
                      route={route}
                      simulationTime={simulationTime}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {currentView === 'unit' && (
          <UnitView
            routes={routes}
            groupingType={groupingType}
            simulationTime={simulationTime}
          />
        )}
      </div>
    </div>
  );
};