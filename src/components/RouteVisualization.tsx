import React from 'react';
import { Truck } from 'lucide-react';
import type { Route, Stop, Vehicle as BaseVehicle } from '../types';
import { getVehicleStatusColor, formatETA } from '../utils/routeUtils';

// Omitimos el status del tipo base para poder redefinirlo
interface ExtendedVehicleBase extends Omit<BaseVehicle, 'status' | 'finalArrivalTime'> {
  imei?: string;
  finalArrivalTime: string | Date | null;
  status?: VehicleStatus | string;
  eta?: string;
  stepEtas?: Record<string, string>;
  stepHistory?: Array<{ stepName: string; entryTime: string; exitTime?: string; timeExceeded?: number }>;
  recentEvents?: Array<{ type: string; timestamp: string }>;
  transitionTime?: string;
  delayMinutes?: number;
  routeStatus?: string;
}

// Redefinimos ExtendedVehicle como el tipo principal
type ExtendedVehicle = ExtendedVehicleBase;

interface RouteVisualizationProps {
  route: Route;
  simulationTime: Date | null;
}

interface VehicleStatus {
  currentStep: string;
  routeStatus: string;
  receptionStatus: string;
  eta: string;
  sectionTime: number;
  exceededTime: number;
  entryTime: string | null;
  transitionTime: string;
  nextStep: string;
  lastUpdate: string;
  alerts: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

// Interfaz para los datos adicionales que vienen del API
interface ApiVehicleData {
  eta?: string;
  stepEtas?: Record<string, string>;
  stepHistory?: Array<{ stepName: string; entryTime: string; exitTime?: string; timeExceeded?: number }>;
  recentEvents?: Array<{ type: string; timestamp: string }>;
  transitionTime?: string;
  delayMinutes?: number;
}

export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  route,
  simulationTime,
}) => {
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

  const getVehicleStatus = (vehicle: ExtendedVehicle): string => {
    // Debug logs
    console.log('Vehicle FULL data:', vehicle);
    console.log('Vehicle data:', {
      id: vehicle.id,
      apiStatus: vehicle.status,
      position: vehicle.position,
      delayMinutes: vehicle.delayMinutes,
      rawStatus: vehicle.status
    });

    // Si status es un string, usarlo directamente
    if (typeof vehicle.status === 'string') {
      console.log('Using direct string status:', vehicle.status);
      return vehicle.status;
    }

    // Si status es un objeto con routeStatus, usarlo
    if (vehicle.status && typeof vehicle.status === 'object' && 'routeStatus' in vehicle.status) {
      console.log('Using API status object:', vehicle.status.routeStatus);
      return vehicle.status.routeStatus;
    }

    // Si hay un routeStatus directo en el vehículo, usarlo
    if (vehicle.routeStatus) {
      console.log('Using direct routeStatus:', vehicle.routeStatus);
      return vehicle.routeStatus;
    }

    // Fallback a la lógica anterior si no hay datos del API
    if (vehicle.delayMinutes && vehicle.delayMinutes > 0) {
      console.log('Using delay status');
      return 'Retrasado';
    }
    if (vehicle.position === 'transit') {
      console.log('Using transit status');
      return 'En tránsito';
    }
    if (vehicle.position === 'stop') {
      console.log('Using stop status');
      return 'En parada';
    }
    console.log('Using default status');
    return 'A tiempo';
  };

  function getStepTimeDisplay(vehicle: ExtendedVehicle, stop: Stop) {
    if (vehicle.stepEtas && vehicle.stepEtas[stop.shortName]) {
      return formatETA(vehicle.stepEtas[stop.shortName]);
    }
    const hist = vehicle.stepHistory?.find(h => h.stepName === stop.shortName);
    if (hist && hist.entryTime) {
      return formatETA(hist.entryTime);
    }
    return '--:--';
  }

  function getTransitionTime(vehicle: ExtendedVehicle) {
    if (typeof vehicle.status === 'object' && vehicle.status?.transitionTime) {
      return formatETA(vehicle.status.transitionTime);
    }
    if (vehicle?.transitionTime) {
      return formatETA(vehicle.transitionTime);
    }
    return '--:--';
  }

  const destination = route.stops[route.stops.length - 1].name;
  const destinationKey = destination.includes('Parque Industrial') ? 'Parque Industrial' : 
                        destination.includes('Centro Financiero') ? 'Centro Financiero' : 
                        destination;

  const getStatusWithDelay = (vehicle: ExtendedVehicle): { status: string; color: string } => {
    const baseStatus = getVehicleStatus(vehicle);
    const delay = vehicle.delayMinutes ?? 0;
    
    if (delay > 0) {
      return {
        status: 'Retrasado',
        color: 'text-red-600'
      };
    }
    
    return {
      status: baseStatus,
      color: getVehicleStatusColor(baseStatus)
    };
  };

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
            // Asegurarnos de que los datos del API se mapeen correctamente
            const baseVehicle = vehicle as BaseVehicle;
            const apiData = vehicle as ApiVehicleData;
            
            const extendedVehicle: ExtendedVehicle = {
              ...baseVehicle,
              finalArrivalTime: baseVehicle.finalArrivalTime as string | null,
              status: vehicle.status || undefined,
              routeStatus: typeof vehicle.status === 'string' ? vehicle.status : undefined,
              eta: apiData.eta || undefined,
              stepEtas: apiData.stepEtas || undefined,
              stepHistory: apiData.stepHistory || undefined,
              recentEvents: apiData.recentEvents || undefined,
              transitionTime: apiData.transitionTime || undefined,
              delayMinutes: apiData.delayMinutes || 0
            };

            console.log('Mapped vehicle data:', extendedVehicle);
            
            const status = getVehicleStatus(extendedVehicle);
            const eta = typeof extendedVehicle.status === 'object' ? 
              extendedVehicle.status?.eta : 
              extendedVehicle.finalArrivalTime;

            // Debug logs
            console.log('ETA debug:', {
              id: vehicle.id,
              rawEta: typeof extendedVehicle.status === 'object' ? extendedVehicle.status?.eta : undefined,
              formattedEta: formatETA(eta),
              status: status,
              statusColor: getVehicleStatusColor(status)
            });

            return (
              <div key={vehicle.id} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{vehicle.id} ETA:</span>
                <div className="flex items-center gap-1">
                  {(() => {
                    const { color } = getStatusWithDelay(extendedVehicle);
                    return (
                      <>
                        <span className={`text-sm font-bold ${color}`}>
                          {formatETA(eta)}
                        </span>
                        {(extendedVehicle.delayMinutes ?? 0) > 0 && (
                          <span className={`text-sm font-medium ${color} ml-1`}>
                            (+{extendedVehicle.delayMinutes} min)
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
          <p className="text-sm text-gray-600">
            Total pasajeros: {route.vehicles.reduce((sum, v) => sum + v.currentPassengers, 0)} / 
            {route.vehicles.reduce((sum, v) => sum + v.capacity, 0)}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="flex justify-between items-center relative">
          {route.stops.map((stop, index) => {
            const vehiclesAtStop = getVehiclesAtStop(stop.id);
            const vehiclesInTransit = index < route.stops.length - 1
              ? getVehiclesInTransit(stop.id, route.stops[index + 1].id)
              : [];

            return (
              <div key={stop.id} className="flex flex-col items-center relative flex-1">
                {vehiclesAtStop.length > 0 && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      {vehiclesAtStop.map((vehicle, vehicleIndex) => {
                        const extendedVehicle = vehicle as ExtendedVehicle;
                        const status = getVehicleStatus(extendedVehicle);
                        return (
                          <div key={vehicle.id} className="flex flex-col items-center" style={{ marginBottom: vehicleIndex > 0 ? '40px' : '0' }}>
                            <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded shadow-md border whitespace-nowrap mb-2">
                              {vehicle.id}
                            </span>
                            <div className="bg-white rounded-lg p-1 shadow-md mb-1">
                              <Truck 
                                className={`w-6 h-6 ${getVehicleStatusColor(status)} hover:scale-110 transition-transform cursor-pointer`}
                              />
                            </div>
                            <span className="text-xs font-medium text-blue-600">
                              {getStepTimeDisplay(extendedVehicle, stop)}
                            </span>
                            {vehiclesAtStop.length > 1 && vehicleIndex === 0 && (
                              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {vehiclesAtStop.length}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-lg z-10 mb-3 ${
                    index === route.stops.length - 1 ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                ></div>

                {index < route.stops.length - 1 && (
                  <div className="absolute top-2 left-1/2 h-0.5 bg-gray-300 z-0 w-full">
                    {vehiclesInTransit.length > 0 && (
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                        <div className="relative z-50">
                          {vehiclesInTransit.map((vehicle, vehicleIndex) => {
                            const extendedVehicle = vehicle as ExtendedVehicle;
                            const status = getVehicleStatus(extendedVehicle);
                            return (
                              <div key={vehicle.id} className="flex flex-col items-center" style={{ marginBottom: vehicleIndex > 0 ? '40px' : '0' }}>
                                <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded shadow-md border whitespace-nowrap mb-2">
                                  {vehicle.id}
                                </span>
                                <div className="bg-white rounded-lg p-1 shadow-md mb-1">
                                  <Truck 
                                    className={`w-6 h-6 ${getVehicleStatusColor(status)} hover:scale-110 transition-transform cursor-pointer animate-pulse`}
                                  />
                                </div>
                                <span className="text-xs font-medium text-blue-600">
                                  {getTransitionTime(extendedVehicle)}
                                </span>
                                {vehiclesInTransit.length > 1 && vehicleIndex === 0 && (
                                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                    {vehiclesInTransit.length}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center">
                  <p className={`font-semibold text-sm mb-1 ${
                    index === route.stops.length - 1 ? 'text-red-700' : 'text-gray-800'
                  }`}>
                    {stop.name}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {route.vehicles.length > 0
                      ? getStepTimeDisplay(route.vehicles[0] as ExtendedVehicle, stop)
                      : '--:--'}
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