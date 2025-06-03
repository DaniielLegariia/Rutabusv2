import React from 'react';
import type { Route, Vehicle as BaseVehicle } from '../types';
import { getVehicleStatusColor, formatETA, calculateETA } from '../utils/routeUtils';

interface ExtendedVehicle extends Omit<BaseVehicle, 'status' | 'finalArrivalTime'> {
  imei?: string;
  finalArrivalTime: string | Date | null;
  status?: string;
  eta?: string;
  delayMinutes?: number;
  routeStatus?: string;
}

interface UnitViewProps {
  routes: Route[];
  groupingType: 'destination' | 'origin' | 'none';
  simulationTime: Date | null;
}

export const UnitView: React.FC<UnitViewProps> = ({ routes, groupingType, simulationTime }) => {
  // Group routes based on groupingType
  const routeGroups = React.useMemo(() => {
    const groups: Record<string, Route[]> = {};
    
    routes.forEach(route => {
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
  }, [routes, groupingType]);

  const getVehicleStatus = (vehicle: ExtendedVehicle): string => {
    if (typeof vehicle.status === 'string') {
      return vehicle.status;
    }
    if (vehicle.delayMinutes && vehicle.delayMinutes > 0) {
      return 'Retrasado';
    }
    if (vehicle.position === 'transit') {
      return 'En tránsito';
    }
    if (vehicle.position === 'stop') {
      return 'En parada';
    }
    return 'A tiempo';
  };

  return (
    <div className="space-y-8">
      {Object.entries(routeGroups).map(([destination, routesInGroup]) => (
        <div key={destination} className="space-y-4">
          {/* Header del grupo */}
          {groupingType !== 'none' && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl font-bold text-white">
                {groupingType === 'destination' && '🎯 Destino: '}
                {groupingType === 'origin' && '🚩 Origen: '}
                {destination}
              </h2>
            </div>
          )}
          
          {/* Tabla de unidades */}
          <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${groupingType === 'none' ? '' : 'mt-4'}`}>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objetivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus Ruta</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routesInGroup.map(route => 
                  route.vehicles.map(vehicle => {
                    const currentStop = route.stops.find(s => s.id === vehicle.currentStopId);
                    const finalStop = route.stops[route.stops.length - 1];
                    const hasArrived = vehicle.finalArrivalTime !== null;
                    const eta = hasArrived ? vehicle.finalArrivalTime : calculateETA(vehicle, route, simulationTime);
                    const isLate = eta && finalStop.arrivalTime && eta > finalStop.arrivalTime;
                    const minutesLate = eta && isLate && finalStop.arrivalTime ? 
                      Math.round((eta.getTime() - finalStop.arrivalTime.getTime()) / 60000) : 0;
                    
                    let location = '';
                    let excessTime = 0;
                    
                    // Calcular tiempo excedido
                    if (vehicle.timeSpent > 0) {
                      const currentStopIndex = route.stops.findIndex(s => s.id === vehicle.currentStopId);
                      
                      if (vehicle.position === 'stop') {
                        const baseStopTime = route.stops[currentStopIndex].stopDuration;
                        if (vehicle.timeSpent > baseStopTime) {
                          excessTime = vehicle.timeSpent - baseStopTime;
                        }
                      } else if (vehicle.position === 'transit') {
                        const baseTravelTime = route.stops[currentStopIndex].travelTime;
                        if (vehicle.timeSpent > baseTravelTime) {
                          excessTime = vehicle.timeSpent - baseTravelTime;
                        }
                      }
                    }
                    
                    // Determinar ubicación
                    if (vehicle.position === 'stop') {
                      location = currentStop?.name || '';
                    } else {
                      const nextStop = route.stops.find(s => s.id === vehicle.nextStopId);
                      location = `${currentStop?.name} → ${nextStop?.name}`;
                    }
                    
                    const status = getVehicleStatus(vehicle as ExtendedVehicle);
                    
                    return (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span className={`${getVehicleStatusColor(status)}`}>{vehicle.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {route.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {location}
                          {excessTime > 0 && (
                            <span className="ml-1 text-xs font-medium text-orange-600">
                              (+{excessTime} min)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {finalStop.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={isLate ? 'text-red-600' : 'text-green-600'}>
                            {eta ? formatETA(eta) : '--:--'}
                            {hasArrived && ' 🏁'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isLate ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              TARDE (+{minutesLate} min)
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              A TIEMPO
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}; 