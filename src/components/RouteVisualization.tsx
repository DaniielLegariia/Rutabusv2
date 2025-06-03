import React from 'react';
import { Truck } from 'lucide-react';
import type { Route, Stop, Vehicle } from '../types';

interface RouteVisualizationProps {
  route: Route;
  simulationTime: Date | null;
}

interface ExtendedVehicle extends Vehicle {
  imei?: string;
  eta?: string;
  delayMinutes?: number;
  stepEtas?: Record<string, string>;
  stepHistory?: Array<{ stepName: string; entryTime: string }>;
  recentEvents?: any[];
  transitionTime?: string;
}

export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  route,
  simulationTime,
}) => {
  const getVehicleColor = () => {
    // Extraer el prefijo de la ruta del nombre de la ruta
    const routePrefix = route.name.split(' ')[0].toUpperCase();
    if (routePrefix.includes('NORTE')) return 'text-blue-600';
    if (routePrefix.includes('SUR')) return 'text-green-600';
    if (routePrefix.includes('ESTE')) return 'text-purple-600';
    if (routePrefix.includes('OESTE')) return 'text-orange-600';
    if (routePrefix.includes('CENTRO')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVehiclesAtStop = (stopId: number) => {
    return route.vehicles.filter(vehicle => vehicle.currentStopId === stopId && vehicle.position === 'stop');
  };

  const getVehiclesInTransit = (fromStopId: number, toStopId: number) => {
    return route.vehicles.filter(
      vehicle =>
        vehicle.position === 'transit' &&
        vehicle.currentStopId === fromStopId &&
        vehicle.nextStopId === toStopId
    );
  };

  const getDestinationColor = (destination: string) => {
    if (destination.includes('Parque Industrial')) return 'bg-green-100 text-green-800 border-green-200';
    if (destination.includes('Centro Financiero')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (destination.includes('Aeropuerto')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  function getStepTimeDisplay(vehicle: ExtendedVehicle, stop: Stop) {
    const hist = vehicle.stepHistory?.find(h => h.stepName === stop.shortName);
    if (hist && hist.entryTime) {
      const entry = new Date(hist.entryTime);
      if (!isNaN(entry.getTime())) {
        return entry.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      }
    }
    if (vehicle.stepEtas && vehicle.stepEtas[stop.shortName]) {
      const eta = new Date(vehicle.stepEtas[stop.shortName]);
      if (!isNaN(eta.getTime())) {
        return eta.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      }
    }
    return '--';
  }

  function getTransitionTime(vehicle: ExtendedVehicle) {
    if (vehicle?.transitionTime) {
      const transition = new Date(vehicle.transitionTime);
      if (!isNaN(transition.getTime())) {
        return transition.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      }
    }
    return '--';
  }

  const destination = route.stops[route.stops.length - 1].name;
  const destinationKey = destination.includes('Parque Industrial') ? 'Parque Industrial' : 
                        destination.includes('Centro Financiero') ? 'Centro Financiero' : 
                        destination;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-indigo-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800">{route.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDestinationColor(destinationKey)}`}>
              → {destinationKey}
            </span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {route.vehicles.map(vehicle => {
            const extendedVehicle = vehicle as ExtendedVehicle;
            const isLate = extendedVehicle.delayMinutes && extendedVehicle.delayMinutes > 0;
            return (
              <div key={vehicle.id} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{vehicle.id} ETA:</span>
                <span className={`text-sm font-bold ${isLate ? 'text-red-600' : 'text-green-600'}`}>
                  {vehicle.finalArrivalTime
                    ? vehicle.finalArrivalTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                  {isLate && ` (+${extendedVehicle.delayMinutes} min)`}
                </span>
              </div>
            );
          })}
          <p className="text-sm text-gray-600">
            Total pasajeros: {route.vehicles.reduce((sum, v) => sum + v.currentPassengers, 0)} / 
            {route.vehicles.reduce((sum, v) => sum + v.capacity, 0)}
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <div className="flex items-start justify-between w-full">
          {route.stops.map((stop, index) => {
            const vehiclesAtStop = getVehiclesAtStop(stop.id);
            const vehiclesInTransit =
              index < route.stops.length - 1
                ? getVehiclesInTransit(stop.id, route.stops[index + 1].id)
                : [];

            return (
              <div key={stop.id} className="flex flex-col items-center relative flex-1">
                {/* Camiones en la parada */}
                {vehiclesAtStop.length > 0 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-50" style={{ top: '-48px' }}>
                    <div className="relative z-50">
                      {vehiclesAtStop.map((vehicle, vehicleIndex) => (
                        <div key={vehicle.id} className="flex flex-col items-center" style={{ marginBottom: vehicleIndex > 0 ? '40px' : '0' }}>
                          <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded shadow-md border whitespace-nowrap mb-2">
                            {vehicle.id}
                          </span>
                          <div className="bg-white rounded-lg p-1 shadow-md mb-1">
                            <Truck 
                              className={`w-6 h-6 ${getVehicleColor()} hover:scale-110 transition-transform cursor-pointer`}
                            />
                          </div>
                          <span className="text-xs font-medium text-blue-600">
                            {getStepTimeDisplay(vehicle as ExtendedVehicle, stop)}
                          </span>
                          {vehiclesAtStop.length > 1 && vehicleIndex === 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              {vehiclesAtStop.length}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Punto de parada */}
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-lg z-10 mb-3 ${
                    index === route.stops.length - 1 ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                ></div>

                {/* Línea entre paradas */}
                {index < route.stops.length - 1 && (
                  <div className="absolute top-2 left-1/2 h-0.5 bg-gray-300 z-0 w-full">
                    {/* Camiones en tránsito */}
                    {vehiclesInTransit.length > 0 && (
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                        <div className="relative z-50">
                          {vehiclesInTransit.map((vehicle, vehicleIndex) => (
                            <div key={vehicle.id} className="flex flex-col items-center" style={{ marginBottom: vehicleIndex > 0 ? '40px' : '0' }}>
                              <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded shadow-md border whitespace-nowrap mb-2">
                                {vehicle.id}
                              </span>
                              <div className="bg-white rounded-lg p-1 shadow-md mb-1">
                                <Truck 
                                  className={`w-6 h-6 ${getVehicleColor()} hover:scale-110 transition-transform cursor-pointer animate-pulse`}
                                />
                              </div>
                              <span className="text-xs font-medium text-blue-600">
                                {getTransitionTime(vehicle as ExtendedVehicle)}
                              </span>
                              {vehiclesInTransit.length > 1 && vehicleIndex === 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                  {vehiclesInTransit.length}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Nombre de parada y hora */}
                <div className="text-center">
                  <p className={`font-semibold text-sm mb-1 ${
                    index === route.stops.length - 1 ? 'text-red-700' : 'text-gray-800'
                  }`}>
                    {stop.name}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {route.vehicles.length > 0
                      ? getStepTimeDisplay(route.vehicles[0] as ExtendedVehicle, stop)
                      : '--'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};