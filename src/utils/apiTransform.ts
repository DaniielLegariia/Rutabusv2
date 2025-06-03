// src/utils/apiTransform.ts
export function transformarRutaApiARoute(apiRoute: any) {
    return {
      id: apiRoute.id,
      name: apiRoute.Name,
      stops: apiRoute.steps.map((step: any) => ({
        id: step.idgeo,
        name: step.Name,
        shortName: step.ShortName, // <-- ¡IMPORTANTE!
        address: step.Coordinates,
        time: step.Config?.MinutesToDestination ? `${step.Config.MinutesToDestination} min` : '',
        arrivalTime: null,
        stopDuration: step.Config?.tolerance?.SectionTime || 0,
        travelTime: step.Transit?.MinutesToDestination || 0,
      })),
      vehicles: [], // Se llenará después
    };
  }