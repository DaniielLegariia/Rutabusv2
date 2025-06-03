import type { Route, Vehicle, Stop } from '../types';

export const getRandomTime = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const calculateRouteTimes = (stops: Stop[], startTime: string): Stop[] => {
  const updatedStops: Stop[] = [];
  let currentTime = new Date(`2024-01-01 ${startTime}`);
  
  stops.forEach((stop, index) => {
    updatedStops.push({
      ...stop,
      time: currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      arrivalTime: new Date(currentTime),
      stopDuration: getRandomTime(5, 10),
      travelTime: index < stops.length - 1 ? getRandomTime(5, 20) : 0
    });
    
    currentTime.setMinutes(currentTime.getMinutes() + updatedStops[index].stopDuration);
    
    if (index < stops.length - 1) {
      currentTime.setMinutes(currentTime.getMinutes() + updatedStops[index].travelTime);
    }
  });
  
  return updatedStops;
};

export const getRandomStartTime = (): string => {
  const hour = 6;
  const minutes = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const generateVehicles = (routePrefix: string, driverNames: string[], numVehicles: number): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  const capacities = [20, 22, 25, 28, 30, 32, 35];
  
  for (let i = 0; i < numVehicles; i++) {
    const capacity = capacities[Math.floor(Math.random() * capacities.length)];
    const currentPassengers = Math.floor(Math.random() * (capacity - 5)) + 5;
    
    vehicles.push({
      id: `${routePrefix}-00${i + 1}`,
      driver: driverNames[i] || `Conductor ${i + 1}`,
      capacity: capacity,
      currentPassengers: currentPassengers,
      status: "en_parada",
      currentStopId: 1,
      position: "stop",
      transitProgress: 0,
      timeSpent: 0,
      targetTime: null,
      nextStopId: undefined,
      finalArrivalTime: null,
      initialDelay: i * getRandomTime(1, 3)
    });
  }
  
  return vehicles;
};

export const getVehicleColor = (vehicleId: string): string => {
  if (vehicleId.includes('TN')) return 'text-blue-600';
  if (vehicleId.includes('TS')) return 'text-green-600';
  if (vehicleId.includes('TE')) return 'text-purple-600';
  if (vehicleId.includes('TO')) return 'text-orange-600';
  if (vehicleId.includes('TC')) return 'text-red-600';
  return 'text-gray-600';
};

export const getVehicleStatusText = (status: string): string => {
  switch (status) {
    case 'en_parada': return 'En Parada';
    case 'en_transito': return 'En Tránsito';
    case 'retrasado': return 'Retrasado';
    default: return 'Desconocido';
  }
};

export const getVehiclesAtStop = (route: Route, stopId: number): Vehicle[] => {
  return route.vehicles.filter(vehicle => 
    vehicle.position === "stop" && vehicle.currentStopId === stopId
  );
};

export const getVehiclesInTransit = (route: Route, fromStopId: number, toStopId: number): Vehicle[] => {
  return route.vehicles.filter(vehicle => 
    vehicle.position === "transit" && 
    vehicle.currentStopId === fromStopId && 
    vehicle.nextStopId === toStopId
  );
};

export const calculateETA = (vehicle: Vehicle, route: Route, currentTime: Date | null): Date | null => {
  if (!currentTime) return null;
  
  if (vehicle.initialDelay && vehicle.targetTime === null) {
    const routeStartTime = route.stops[0].arrivalTime;
    const vehicleStartTime = new Date(routeStartTime);
    vehicleStartTime.setMinutes(vehicleStartTime.getMinutes() + vehicle.initialDelay);
    
    if (currentTime < vehicleStartTime) {
      const totalRouteTime = route.stops.reduce((acc, stop, index) => {
        if (index < route.stops.length - 1) {
          return acc + stop.stopDuration + stop.travelTime;
        }
        return acc;
      }, 0);
      
      const eta = new Date(vehicleStartTime);
      eta.setMinutes(eta.getMinutes() + totalRouteTime);
      return eta;
    }
  }
  
  const currentStopIndex = route.stops.findIndex(s => s.id === vehicle.currentStopId);
  const finalStopIndex = route.stops.length - 1;
  
  if (currentStopIndex === finalStopIndex && vehicle.position === "stop") {
    return route.stops[finalStopIndex].arrivalTime;
  }
  
  let totalRemainingTime = 0;
  
  if (vehicle.targetTime && vehicle.timeSpent < vehicle.targetTime) {
    totalRemainingTime += (vehicle.targetTime - vehicle.timeSpent);
  }
  
  if (vehicle.position === "stop") {
    for (let i = currentStopIndex; i < finalStopIndex; i++) {
      if (i === currentStopIndex) {
        totalRemainingTime += route.stops[i].travelTime || 0;
      } else {
        totalRemainingTime += route.stops[i].stopDuration || 0;
        totalRemainingTime += route.stops[i].travelTime || 0;
      }
    }
  } else if (vehicle.position === "transit") {
    const nextStopIndex = currentStopIndex + 1;
    for (let i = nextStopIndex; i < finalStopIndex; i++) {
      totalRemainingTime += route.stops[i].stopDuration || 0;
      totalRemainingTime += route.stops[i].travelTime || 0;
    }
  }
  
  const eta = new Date(currentTime);
  eta.setMinutes(eta.getMinutes() + totalRemainingTime);
  
  return eta;
};

export const getVehicleStatusColor = (status: string): string => {
  // Debug log
  console.log('getVehicleStatusColor input:', { status });
  
  const normalizedStatus = status?.toLowerCase().trim();
  console.log('Normalized status:', normalizedStatus);
  
  switch (normalizedStatus) {
    case 'a tiempo':
      return 'text-green-600';
    case 'retrasado':
      return 'text-red-600';
    case 'en tránsito':
    case 'en transito':
      return 'text-blue-600';
    case 'en parada':
      return 'text-purple-600';
    default:
      console.log('Warning: Unknown status, defaulting to gray', { originalStatus: status, normalized: normalizedStatus });
      return 'text-gray-600';
  }
};

export const formatETA = (time: Date | string | null): string => {
  if (!time) return '--:--';
  
  try {
    console.log('formatETA input:', { 
      time, 
      type: typeof time,
      rawValue: time.toString(),
      isDate: time instanceof Date
    });
    
    let date: Date;
    if (typeof time === 'string') {
      // Si es una fecha ISO, la parseamos
      date = new Date(time);
      console.log('Parsed string to date:', {
        originalString: time,
        parsedDate: date,
        hours: date.getHours(),
        minutes: date.getMinutes()
      });
    } else {
      date = time;
      console.log('Using date directly:', {
        date: date,
        hours: date.getHours(),
        minutes: date.getMinutes()
      });
    }
    
    if (isNaN(date.getTime())) {
      console.log('Invalid date detected');
      return '--:--';
    }
    
    // Formatear manualmente para asegurar el formato correcto
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    console.log('Time components:', {
      hours,
      minutes,
      rawHours: date.getHours(),
      rawMinutes: date.getMinutes(),
      formattedResult: `${hours}:${minutes}`
    });
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--';
  }
}; 