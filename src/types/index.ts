export interface Stop {
  id: number;
  name: string;
  shortName: string; // <-- ¡AGREGA ESTO!
  address: string;
  time: string;
  arrivalTime: Date | null;
  stopDuration: number;
  travelTime: number;
}

export interface Vehicle {
  id: string;
  driver: string;
  capacity: number;
  currentPassengers: number;
  status: 'en_parada' | 'en_transito' | 'retrasado';
  currentStopId: number;
  position: 'stop' | 'transit';
  transitProgress: number;
  timeSpent: number;
  targetTime: number | null;
  nextStopId?: number;
  finalArrivalTime: Date | null;
  initialDelay: number;
}

export interface Route {
  id: number;
  name: string;
  stops: Stop[];
  vehicles: Vehicle[];
}

export interface NavigationMenuItem {
  id: string;
  name: string;
  icon: React.ComponentType;
  description: string;
} 