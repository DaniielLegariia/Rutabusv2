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
  const getVehicleColor = (vehicleId: string) => {
    if (vehicleId.includes('TN')) return 'text-blue-600';
    if (vehicleId.includes('TS')) return 'text-green-600';
    if (vehicleId.includes('TE')) return 'text-purple-600';
    if (vehicleId.includes('TO')) return 'text-orange-600';
    if (vehicleId.includes('TC')) return 'text-red-600';
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
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-50" style={{ top: '-8px' }}>
                    <div className="relative z-50">
                      <div className="bg-white rounded-lg p-1 shadow-md">
                        <Truck 
                          className={`w-6 h-6 ${getVehicleColor(vehiclesAtStop[0].id)} hover:scale-110 transition-transform cursor-pointer`}
                        />
                        {vehiclesAtStop.length > 1 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {vehiclesAtStop.length}
                          </span>
                        )}
                      </div>
                      {vehiclesAtStop.map((vehicle, vehicleIndex) => (
                        <span 
                          key={vehicle.id}
                          className="absolute left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white px-1 rounded shadow-md border whitespace-nowrap z-50"
                          style={{ bottom: `${(vehiclesAtStop.length - vehicleIndex) * 24 + 28}px` }}
                        >
                          {vehicle.id}
                        </span>
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
                          <div className="bg-white rounded-lg p-1 shadow-md">
                            <Truck 
                              className={`w-6 h-6 ${getVehicleColor(vehiclesInTransit[0].id)} hover:scale-110 transition-transform cursor-pointer animate-pulse`}
                            />
                            {vehiclesInTransit.length > 1 && (
                              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {vehiclesInTransit.length}
                              </span>
                            )}
                          </div>
                          {vehiclesInTransit.map((vehicle, vehicleIndex) => (
                            <span 
                              key={vehicle.id}
                              className="absolute left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white px-1 rounded shadow-md border whitespace-nowrap z-50"
                              style={{ bottom: `${(vehiclesInTransit.length - vehicleIndex) * 24 + 28}px` }}
                            >
                              {vehicle.id}
                            </span>
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