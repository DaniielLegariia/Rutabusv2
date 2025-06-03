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