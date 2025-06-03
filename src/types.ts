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

export interface GeofenceFormValues {
  name: string;
  shortName: string;
  coordinates: string;
  tipogeo: number | 'Circular' | 'Poligonal';
  radius?: number;
}

export interface GeofenceListResponse {
  GEOCERCAS: RawGeofenceData[];
}

export interface VehicleFromPlatform {
  IDGPS: number;
  NOMBRE: string;
  ID_UNIDAD: number;
  IMEI: string;
  ID_CLIENTE: number;
}

export interface SavedVehicle {
  idcliente: number;
  imei: string;
  plataform_name: string;
  short_name: string;
  rutas_asignadas: string[];
  rutas_nombres: string[];
  estado: 'completo' | 'parcial';
  // Campos adicionales para el sistema
  tipo?: 'Sprinter' | 'Microbus' | 'Autobús';
  año?: number;
}

export interface VehicleFormData {
  imei: string;
  nombre_plataforma: string;
  nombre_corto: string;
  idcliente: string | number;
  tipo?: 'Sprinter' | 'Microbus' | 'Autobús';
  año?: number;
}

export interface SavedVehiclesResponse {
  statusCode: number;
  body: {
    mensaje: string;
    datos: SavedVehicle[];
    conteo: number;
  };
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