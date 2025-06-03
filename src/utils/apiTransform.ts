// src/utils/apiTransform.ts
import type { Route, RouteApiData, RouteFormData } from '../types';

export function transformarRutaApiARoute(apiRoute: RouteApiData): Route {
  return {
    id: apiRoute.id || 0,
    name: apiRoute.Name,
    stops: apiRoute.steps.map(step => ({
      id: step.idgeo,
      name: step.Name,
      shortName: step.ShortName,
      address: step.Coordinates,
      time: step.Config?.MinutesToDestination ? `${step.Config.MinutesToDestination} min` : '',
      arrivalTime: null,
      stopDuration: step.Config?.tolerance?.SectionTime || 0,
      travelTime: step.Transit?.MinutesToDestination || 0,
    })),
    vehicles: apiRoute.units?.map(unit => ({
      id: unit.imei,
      name: unit.platform_name,
      shortName: unit.short_name,
      currentStopId: 0,
      nextStopId: 0,
      position: 'stop',
      currentPassengers: 0,
      capacity: 0,
      finalArrivalTime: null,
      routeId: unit.idruta_asignada
    })) || [],
  };
}

export function transformRouteToApiData(formData: RouteFormData): Omit<RouteApiData, 'id'> {
  return {
    Name: formData.name,
    Description: formData.description,
    tolerance: {
      OnTime: formData.toleranceOnTime,
      Delayed: formData.toleranceDelay,
      Late: formData.toleranceDelay,
    },
    dissociate: {
      config: formData.disassociateVehicle ? 'auto' : 'manual',
      trigger: formData.disassociateVehicle ? formData.disassociateVehicleTrigger || '' : '',
      referenceTime: formData.disassociateVehicle ? formData.disassociateVehicleTime || 0 : 0,
      referenceDateTime: '',
    },
    FinalDestination: {
      time: formData.finalDestinationAuto ? '' : formData.finalDestination?.toISOString() || '',
    },
    steps: formData.steps,
  };
}

export function transformApiDataToFormData(apiData: RouteApiData): RouteFormData {
  return {
    name: apiData.Name,
    description: apiData.Description,
    toleranceOnTime: apiData.tolerance.OnTime,
    toleranceDelay: apiData.tolerance.Delayed,
    disassociateVehicle: apiData.dissociate.config === 'auto',
    disassociateVehicleTrigger: apiData.dissociate.trigger,
    disassociateVehicleTime: apiData.dissociate.referenceTime,
    finalDestinationAuto: !apiData.FinalDestination.time,
    finalDestination: apiData.FinalDestination.time ? new Date(apiData.FinalDestination.time) : undefined,
    steps: apiData.steps,
  };
}