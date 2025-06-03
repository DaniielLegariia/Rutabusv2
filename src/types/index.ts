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

export interface RouteStep {
  idgeo: number;
  Name: string;
  ShortName: string;
  Coordinates: string;
  Config?: {
    MinutesToDestination?: number;
    tolerance?: {
      SectionTime: number;
    };
  };
  Transit?: {
    MinutesToDestination: number;
  };
}

export interface RouteUnit {
  platform_name: string;
  imei: string;
  created_at: string;
  short_name: string;
  idruta_asignada: string;
}

export interface RouteApiData {
  id?: number;
  Name: string;
  Description: string;
  tolerance: {
    OnTime: number;
    Delayed: number;
    Late: number;
  };
  dissociate: {
    config: 'auto' | 'manual';
    trigger: string;
    referenceTime: number;
    referenceDateTime: string;
  };
  FinalDestination: {
    time: string;
  };
  steps: RouteStep[];
  units?: RouteUnit[];
}

export interface RouteFormData {
  name: string;
  description: string;
  toleranceOnTime: number;
  toleranceDelay: number;
  disassociateVehicle: boolean;
  disassociateVehicleTrigger?: string;
  disassociateVehicleTime?: number;
  finalDestinationAuto: boolean;
  finalDestination?: Date;
  steps: RouteStep[];
}

export interface GeofenceFormValues {
  idgeo?: number;
  name: string;
  shortName: string;
  coordinates: string;
  tipogeo: number;
  radius?: number;
  sectionTime?: number;
  transitSectionTime?: number;
  idcliente?: string;
}

export interface Geofence extends GeofenceFormValues {
  idgeo: number;
  idcliente: string;
}

// API Response Types
export interface ApiErrorResponse {
  statusCode: number;
  body: {
    error?: string;
    message?: string;
    requiredFields?: string[];
  };
}

export interface ApiSuccessResponse<T> {
  statusCode: number;
  body: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RawGeofenceData {
  idgeo?: number;
  id_geocerca?: number;
  name?: string;
  name_plataforma?: string;
  shortName: string;
  coordinates: string;
  tipogeo: number | string;
  radius?: number;
}

export interface Geofence {
  idgeo: number;
  name: string;
  shortName: string;
  coordinates: string;
  tipogeo: number;
  radius?: number;
}

export interface GeofenceListResponse {
  GEOCERCAS: RawGeofenceData[];
}

// Helper function to check if response is an error
export const isApiError = (response: unknown): response is ApiErrorResponse => {
  if (!response || typeof response !== 'object') return false;
  const resp = response as { statusCode?: number; body?: { error?: string } };
  return (resp.statusCode ?? 0) >= 400 && typeof resp.body?.error === 'string';
};

// Helper function to get a user-friendly error message
export const getApiErrorMessage = (error: ApiErrorResponse): string => {
  if (error.body.message) {
    return error.body.message;
  }
  
  switch (error.statusCode) {
    case 400:
      return 'Datos inválidos. Por favor revise la información ingresada.';
    case 401:
      return 'No autorizado. Por favor inicie sesión nuevamente.';
    case 403:
      return 'No tiene permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 500:
      return 'Error interno del servidor. Por favor intente más tarde.';
    default:
      return 'Ocurrió un error inesperado. Por favor intente nuevamente.';
  }
}; 