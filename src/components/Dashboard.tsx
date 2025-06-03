import React, { useState, useEffect } from 'react';
import { ControlTower } from './ControlTower';
import { RouteVisualization } from './RouteVisualization';
import { getListRutas, getLastEventUnits } from '../api/Apis.tsx';
import { transformarRutaApiARoute } from '../utils/apiTransform';
import type { Route } from '../types';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const idcliente = 110; // Cambia esto según tu lógica

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Obtén las rutas
        const rutasData = await getListRutas(idcliente);
        const rutasTransformadas = rutasData.body.routes.map(transformarRutaApiARoute);

        // 2. Obtén las unidades en tiempo real
        const unidadesData = await getLastEventUnits([String(idcliente)]);
        const unidades = unidadesData.body.units;

        // 3. Asocia las unidades a sus rutas y paradas correctas usando ShortName
        const rutasConUnidades = rutasTransformadas.map((ruta: Route) => {
          const unidadesDeRuta = unidades.filter((u: any) => u.routeId === String(ruta.id));
          return {
            ...ruta,
            vehicles: unidadesDeRuta.map((unidad: any) => {
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
      } catch (error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ControlTower
        routes={routes}
        simulationRunning={false}
        simulationTime={null}
        onToggleSimulation={() => {}}
        currentView="route"
        onViewChange={() => {}}
        groupingType="none"
        onGroupingChange={() => {}}
      />
      <div className="max-w-7xl mx-auto px-4 py-6 mt-40">
        {routes.map(route => (
          <RouteVisualization
            key={route.id}
            route={route}
            simulationTime={null}
          />
        ))}
      </div>
    </div>
  );
};