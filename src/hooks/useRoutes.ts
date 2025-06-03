import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getListRutas, insertRoute, DeleteRoute, updateRoute, getRoute } from '../api/Apis';
import { transformarRutaApiARoute } from '../utils/apiTransform';
import type { Route, RouteApiData } from '../types';

interface UseRoutesProps {
  idcliente: number;
}

interface ApiResponse<T> {
  statusCode: number;
  body: {
    message: string;
    idcliente: string;
    routes?: RouteApiData[];
    route?: RouteApiData;
  } & T;
}

export function useRoutes({ idcliente }: UseRoutesProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getListRutas(idcliente) as ApiResponse<{ routes: RouteApiData[] }>;
      if (response.statusCode === 200 && response.body.routes) {
        const transformedRoutes = response.body.routes.map(transformarRutaApiARoute);
        setRoutes(transformedRoutes);
        setError(null);
      } else {
        throw new Error('Error al obtener las rutas');
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Error al cargar las rutas');
      message.error('Error al cargar las rutas');
    } finally {
      setLoading(false);
    }
  }, [idcliente]);

  const createRoute = async (routeData: Omit<RouteApiData, 'id'>) => {
    setLoading(true);
    try {
      const response = await insertRoute([routeData]) as ApiResponse<{}>;
      if (response.statusCode === 200) {
        message.success('Ruta creada exitosamente');
        await fetchRoutes();
        return true;
      } else {
        throw new Error(response.body?.message || 'Error al crear la ruta');
      }
    } catch (err) {
      console.error('Error creating route:', err);
      setError('Error al crear la ruta');
      message.error('Error al crear la ruta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async (routeId: number) => {
    setLoading(true);
    try {
      const response = await DeleteRoute(routeId, idcliente) as ApiResponse<{}>;
      if (response?.statusCode === 200) {
        message.success(response.body?.message || 'Ruta eliminada exitosamente');
        await fetchRoutes();
        return true;
      } else {
        throw new Error(response?.body?.message || 'Error al eliminar la ruta');
      }
    } catch (err) {
      console.error('Error deleting route:', err);
      setError('Error al eliminar la ruta');
      message.error('Error al eliminar la ruta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRouteData = async (routeId: number, routeData: Omit<RouteApiData, 'id'>) => {
    setLoading(true);
    try {
      const response = await updateRoute(routeId, idcliente, routeData) as ApiResponse<{}>;
      if (response.statusCode === 200) {
        message.success('Ruta actualizada exitosamente');
        await fetchRoutes();
        return true;
      } else {
        throw new Error(response.body?.message || 'Error al actualizar la ruta');
      }
    } catch (err) {
      console.error('Error updating route:', err);
      setError('Error al actualizar la ruta');
      message.error('Error al actualizar la ruta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRouteDetails = async (routeId: number) => {
    setLoading(true);
    try {
      const response = await getRoute(routeId, idcliente) as ApiResponse<{ route: RouteApiData }>;
      if (response.statusCode === 200 && response.body.route) {
        return transformarRutaApiARoute(response.body.route);
      }
      return null;
    } catch (err) {
      console.error('Error getting route details:', err);
      setError('Error al obtener los detalles de la ruta');
      message.error('Error al obtener los detalles de la ruta');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute,
    deleteRoute,
    updateRouteData,
    getRouteDetails
  };
} 