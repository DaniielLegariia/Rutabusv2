import type { Route, Stop } from '../types';
import { calculateRouteTimes, generateVehicles, getRandomStartTime } from '../utils/routeUtils';

const createStop = (id: number, name: string, address: string, time: string): Stop => ({
  id,
  name,
  address,
  time,
  arrivalTime: new Date(),
  stopDuration: 5,
  travelTime: 10
});

export const initialRoutes: Route[] = [
  {
    id: 1,
    name: "Ruta Norte - Ejecutiva",
    stops: calculateRouteTimes([
      createStop(1, "Terminal Central", "Av. Principal 123", "08:00"),
      createStop(2, "Zona Norte", "Calle Norte 456", "08:15"),
      createStop(3, "Plaza Comercial", "Blvd. Comercial 789", "08:30"),
      createStop(4, "Oficinas Corp.", "Torre Empresarial 321", "08:45"),
      createStop(5, "Parque Industrial", "Zona Industrial 654", "09:00")
    ], getRandomStartTime()),
    vehicles: generateVehicles("TN", ["Carlos García", "Ana Martínez", "Luis Rodríguez"], Math.floor(Math.random() * 3) + 1)
  },
  {
    id: 2,
    name: "Ruta Sur - Completa",
    stops: calculateRouteTimes([
      createStop(1, "Terminal Sur", "Av. Sur 111", "08:00"),
      createStop(2, "Las Flores", "Calle Flores 222", "08:15"),
      createStop(3, "Universidad", "Campus Universitario 333", "08:30"),
      createStop(4, "C. Médico", "Hospital 444", "08:45"),
      createStop(5, "Plaza Norte", "Mall Norte 555", "09:00"),
      createStop(6, "C. Negocios", "Plaza Negocios 777", "09:15"),
      createStop(7, "Parque Industrial", "Zona Industrial Alt 888", "09:30")
    ], getRandomStartTime()),
    vehicles: generateVehicles("TS", ["María López", "Pedro Sánchez", "Carmen Díaz"], Math.floor(Math.random() * 3) + 1)
  },
  {
    id: 3,
    name: "Ruta Este - Express",
    stops: calculateRouteTimes([
      createStop(1, "Estación Este", "Terminal Este 555", "08:00"),
      createStop(2, "Centro Médico", "Hospital Regional 777", "08:15"),
      createStop(3, "Centro Financiero", "Torre Financiera 888", "08:30")
    ], getRandomStartTime()),
    vehicles: generateVehicles("TE", ["Roberto Díaz", "Patricia Gómez", "Miguel Ángel Torres"], Math.floor(Math.random() * 3) + 1)
  },
  {
    id: 4,
    name: "Ruta Oeste - Metropolitana",
    stops: calculateRouteTimes([
      createStop(1, "Terminal Oeste", "Av. Oeste 100", "08:00"),
      createStop(2, "Col. Americana", "Zona Americana 200", "08:15"),
      createStop(3, "Chapalita", "Plaza Chapalita 300", "08:30"),
      createStop(4, "Providencia", "Av. Providencia 400", "08:45"),
      createStop(5, "Zapopan Centro", "Centro Zapopan 500", "09:00"),
      createStop(6, "Plaza del Sol", "C.C. Plaza del Sol 600", "09:15"),
      createStop(7, "Patria", "Av. Patria 700", "09:30"),
      createStop(8, "Las Águilas", "Fracc. Las Águilas 800", "09:45"),
      createStop(9, "Ciudad Granja", "Ciudad Granja 900", "10:00"),
      createStop(10, "Centro Financiero", "Torre Financiera Principal 1000", "10:15")
    ], getRandomStartTime()),
    vehicles: generateVehicles("TO", ["Carmen Silva", "José Hernández", "Laura Medina"], Math.floor(Math.random() * 3) + 1)
  },
  {
    id: 5,
    name: "Ruta Centro - Histórica",
    stops: calculateRouteTimes([
      createStop(1, "Catedral", "Centro Histórico 1", "08:00"),
      createStop(2, "Mercado", "Mercado San Juan 2", "08:15"),
      createStop(3, "Teatro", "Teatro Degollado 3", "08:30"),
      createStop(4, "Hospicio", "Hospicio Cabañas 4", "08:45"),
      createStop(5, "Plaza Armas", "Plaza de Armas 5", "09:00"),
      createStop(6, "Aeropuerto", "Aeropuerto Internacional 6", "09:15")
    ], getRandomStartTime()),
    vehicles: generateVehicles("TC", ["Eduardo Morales", "Sofía Ramírez", "Antonio Vega"], Math.floor(Math.random() * 3) + 1)
  }
]; 