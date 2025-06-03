import React, { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';
import { useRoutes } from '../hooks/useRoutes';
import { RouteForm } from './RouteForm';
import type { Route, RouteApiData } from '../types';

interface RoutesSectionProps {
  idcliente: number;
  groupingType: 'destination' | 'origin' | 'none';
  setGroupingType: (type: 'destination' | 'origin' | 'none') => void;
}

export const RoutesSection: React.FC<RoutesSectionProps> = ({
  idcliente,
  groupingType,
  setGroupingType
}) => {
  const {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute,
    deleteRoute,
    updateRouteData,
    getRouteDetails
  } = useRoutes({ idcliente });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleCreateRoute = async (routeData: Omit<RouteApiData, 'id'>) => {
    setModalLoading(true);
    try {
      await createRoute(routeData);
      setIsModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateRoute = async (routeData: Omit<RouteApiData, 'id'>) => {
    if (!selectedRoute) return;
    setModalLoading(true);
    try {
      await updateRouteData(selectedRoute.id, routeData);
      setIsModalVisible(false);
      setSelectedRoute(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRoute = async (routeId: number) => {
    Modal.confirm({
      title: '¿Estás seguro de que deseas eliminar esta ruta?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => deleteRoute(routeId)
    });
  };

  const handleEditRoute = async (routeId: number) => {
    const routeDetails = await getRouteDetails(routeId);
    if (routeDetails) {
      setSelectedRoute(routeDetails);
      setIsModalVisible(true);
    }
  };

  // Función para agrupar rutas por destino
  const groupRoutesByDestination = (routes: Route[]) => {
    const groups: Record<string, Route[]> = {};
    routes.forEach(route => {
      const destination = route.stops[route.stops.length - 1].name;
      const destinationKey = destination.includes('Parque Industrial') ? 'Parque Industrial' : 
                           destination.includes('Centro Financiero') ? 'Centro Financiero' : 
                           destination;
      if (!groups[destinationKey]) {
        groups[destinationKey] = [];
      }
      groups[destinationKey].push(route);
    });
    return groups;
  };

  // Función para agrupar rutas por origen
  const groupRoutesByOrigin = (routes: Route[]) => {
    const groups: Record<string, Route[]> = {};
    routes.forEach(route => {
      const origin = route.stops[0].name;
      if (!groups[origin]) {
        groups[origin] = [];
      }
      groups[origin].push(route);
    });
    return groups;
  };

  // Obtener las rutas agrupadas según el tipo seleccionado
  const getGroupedRoutes = () => {
    switch (groupingType) {
      case 'destination':
        return groupRoutesByDestination(routes);
      case 'origin':
        return groupRoutesByOrigin(routes);
      case 'none':
        return { 'Todas las Rutas': routes };
      default:
        return groupRoutesByDestination(routes);
    }
  };

  const routeGroups = getGroupedRoutes();

  if (loading && !routes.length) {
    return <Spin size="large" />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const getDestinationColor = (dest: string) => {
    switch (dest) {
      case 'Parque Industrial': return 'bg-green-100 text-green-800 border-green-200';
      case 'Centro Financiero': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Aeropuerto': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOriginColor = (orig: string) => {
    if (orig.includes('Terminal Central')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (orig.includes('Terminal Sur')) return 'bg-red-100 text-red-800 border-red-200';
    if (orig.includes('Estación Este')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (orig.includes('Terminal Oeste')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (orig.includes('Catedral')) return 'bg-pink-100 text-pink-800 border-pink-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getBadgeInfo = (route: Route) => {
    const destination = route.stops[route.stops.length - 1].name;
    const origin = route.stops[0].name;
    const destinationKey = destination.includes('Parque Industrial') ? 'Parque Industrial' : 
                         destination.includes('Centro Financiero') ? 'Centro Financiero' : 
                         destination;

    switch (groupingType) {
      case 'destination':
        return { text: `→ ${destinationKey}`, color: getDestinationColor(destinationKey) };
      case 'origin':
        return { text: `↗ ${origin}`, color: getOriginColor(origin) };
      case 'none':
        return { text: `${route.stops.length} paradas`, color: 'bg-gray-100 text-gray-800 border-gray-200' };
      default:
        return { text: '', color: '' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuración de Rutas</h2>
            <p className="text-gray-600 mt-1">Gestiona y configura las rutas del sistema</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setGroupingType('destination')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                groupingType === 'destination' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Por Destino
            </button>
            <button
              onClick={() => setGroupingType('origin')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                groupingType === 'origin' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Por Origen
            </button>
            <button
              onClick={() => setGroupingType('none')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                groupingType === 'none' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sin Agrupar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(routeGroups).map(([groupName, routesInGroup]) => (
          <div key={groupName} className="space-y-4">
            {/* Header del grupo */}
            {groupingType !== 'none' && (
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-3 shadow">
                <h3 className="text-lg font-bold text-white">
                  {groupingType === 'destination' && '🎯 Destino: '}
                  {groupingType === 'origin' && '🚩 Origen: '}
                  {groupName}
                </h3>
                <p className="text-gray-300 text-sm">
                  {routesInGroup.length} ruta{routesInGroup.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
            
            {/* Rutas del grupo */}
            <div className={`space-y-3 ${groupingType !== 'none' ? 'ml-4' : ''}`}>
              {routesInGroup.map(route => {
                const badgeInfo = getBadgeInfo(route);
                const vehicleCount = route.vehicles.length;
                const totalCapacity = route.vehicles.reduce((sum, v) => sum + v.capacity, 0);
                
                return (
                  <div key={route.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{route.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badgeInfo.color}`}>
                            {badgeInfo.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{route.stops.length} paradas</span>
                          <span>•</span>
                          <span>{vehicleCount} vehículo{vehicleCount > 1 ? 's' : ''} asignado{vehicleCount > 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>Capacidad total: {totalCapacity} pasajeros</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Recorrido:</span> {route.stops.map(s => s.name).join(' → ')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRoute(route.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsModalVisible(true)}
        className="w-full mt-6 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + Agregar Nueva Ruta
      </button>

      <Modal
        title={selectedRoute ? 'Editar Ruta' : 'Crear Nueva Ruta'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedRoute(null);
        }}
        footer={null}
        width={800}
      >
        <RouteForm
          initialValues={selectedRoute || undefined}
          onSubmit={selectedRoute ? handleUpdateRoute : handleCreateRoute}
          loading={modalLoading}
        />
      </Modal>
    </div>
  );
}; 