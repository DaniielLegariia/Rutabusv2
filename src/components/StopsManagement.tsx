import React, { useState, useEffect } from 'react';
import { MapPin, Eye, Edit2, Trash2 } from 'lucide-react';
import { message, Modal, Spin } from 'antd';
import { getListGeofences, insertGeofence, updateGeofence, deleteGeofence } from '../api/Apis';
import type { GeofenceInsertData } from '../api/Apis';
import { StopForm } from './StopForm';
import { GeofenceMap } from './GeofenceMap';
import type { 
  Geofence, 
  GeofenceFormValues, 
  ApiResponse,
  ApiErrorResponse,
  RawGeofenceData
} from '../types';
import { isApiError, getApiErrorMessage } from '../types';

interface StopsManagementProps {
  idcliente: number;
}

export const StopsManagement: React.FC<StopsManagementProps> = ({ idcliente }) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEditStop, setSelectedEditStop] = useState<Geofence | null>(null);
  const [selectedViewStop, setSelectedViewStop] = useState<Geofence | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleApiError = (error: ApiErrorResponse) => {
    const errorMessage = getApiErrorMessage(error);
    message.error(errorMessage);
    setError(errorMessage);
  };

  const fetchGeofences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getListGeofences(idcliente.toString());
      
      if (isApiError(response)) {
        handleApiError(response);
        setGeofences([]);
        return;
      }

      if (response.statusCode === 200 && Array.isArray(response.body?.GEOCERCAS)) {
        const transformedGeofences: Geofence[] = response.body.GEOCERCAS.map((geofence: RawGeofenceData) => ({
          idgeo: geofence.idgeo || geofence.id_geocerca || 0,
          name: geofence.name || geofence.name_plataforma || '',
          shortName: geofence.shortName || '',
          coordinates: geofence.coordinates || '',
          tipogeo: typeof geofence.tipogeo === 'string' 
            ? (geofence.tipogeo.toLowerCase() === 'circular' ? 1 : 2)
            : Number(geofence.tipogeo) || 1,
          radius: typeof geofence.radius === 'number' ? geofence.radius : undefined
        }));
        setGeofences(transformedGeofences);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error fetching geofences:', error);
      setError('Error al cargar los puntos de control');
      message.error('Error al cargar los puntos de control');
      setGeofences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, [idcliente]);

  const getStopType = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('terminal') || lowerName.includes('estación')) return 'Terminal';
    if (lowerName.includes('hospital') || lowerName.includes('médico')) return 'Hospital';
    if (lowerName.includes('universidad') || lowerName.includes('campus')) return 'Educativo';
    if (lowerName.includes('plaza') || lowerName.includes('mall')) return 'Comercial';
    if (lowerName.includes('aeropuerto')) return 'Aeropuerto';
    if (lowerName.includes('parque industrial')) return 'Industrial';
    return 'Regular';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Terminal': return 'bg-red-100 text-red-800';
      case 'Hospital': return 'bg-blue-100 text-blue-800';
      case 'Educativo': return 'bg-purple-100 text-purple-800';
      case 'Comercial': return 'bg-green-100 text-green-800';
      case 'Aeropuerto': return 'bg-indigo-100 text-indigo-800';
      case 'Industrial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAddressFromCoordinates = (coordinates: string) => {
    const coords = coordinates.split('|').filter(Boolean);
    if (coords.length >= 2) {
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    return 'Dirección no disponible';
  };

  const handleDeleteStop = async (id: number) => {
    try {
      const response = await deleteGeofence(id, idcliente);
      
      if (!response) {
        message.error('No se pudo conectar con el servidor');
        return;
      }

      if (isApiError(response)) {
        handleApiError(response);
        return;
      }

      message.success('Punto de control eliminado exitosamente');
      fetchGeofences();
    } catch (error) {
      console.error('Error deleting stop:', error);
      message.error('Error al eliminar el punto de control');
    }
  };

  const handleCreateStop = async (values: GeofenceFormValues) => {
    setFormLoading(true);
    try {
      const geofenceData: GeofenceInsertData = {
        idgeo: Math.floor(Math.random() * (999999 - 1000 + 1)) + 1000,
        name: values.name,
        shortName: values.shortName,
        idcliente: idcliente.toString(),
        sectionTime: 0,
        transitSectionTime: 0,
        coordinates: values.coordinates,
        tipogeo: typeof values.tipogeo === 'string' ? (values.tipogeo === 'Circular' ? 1 : 2) : values.tipogeo,
        radius: values.radius
      };

      const response = await insertGeofence(geofenceData);

      if (!response) {
        message.error('No se pudo conectar con el servidor');
        return;
      }

      const apiResponse = await response.json() as ApiResponse<{ success: boolean }>;
      
      if (isApiError(apiResponse)) {
        handleApiError(apiResponse);
        return;
      }

      if (response.ok) {
        message.success('Punto de control creado exitosamente');
        setEditModalVisible(false);
        fetchGeofences();
      } else {
        message.error('Error al crear el punto de control');
      }
    } catch (error) {
      console.error('Error creating stop:', error);
      message.error('Error al crear el punto de control');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStop = async (values: GeofenceFormValues) => {
    if (!selectedEditStop) return;
    setFormLoading(true);
    try {
      const response = await updateGeofence(
        selectedEditStop.idgeo.toString(),
        values.name,
        values.shortName,
        0,
        0,
        idcliente.toString()
      );

      if (!response) {
        message.error('No se pudo conectar con el servidor');
        return;
      }

      const apiResponse = await response.json() as ApiResponse<{ success: boolean }>;
      
      if (isApiError(apiResponse)) {
        handleApiError(apiResponse);
        return;
      }

      if (response.ok) {
        message.success('Punto de control actualizado exitosamente');
        setEditModalVisible(false);
        setSelectedEditStop(null);
        fetchGeofences();
      } else {
        message.error('Error al actualizar el punto de control');
      }
    } catch (error) {
      console.error('Error updating stop:', error);
      message.error('Error al actualizar el punto de control');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (stop: Geofence) => {
    setSelectedEditStop(stop);
    setEditModalVisible(true);
  };

  const handleViewClick = (stop: Geofence) => {
    setSelectedViewStop(stop);
    setViewModalVisible(true);
  };

  // Estadísticas
  const totalStops = geofences.length;
  const terminals = geofences.filter(stop => 
    stop.name.toLowerCase().includes('terminal') || 
    stop.name.toLowerCase().includes('estación')
  ).length;
  const commercial = geofences.filter(stop => 
    stop.name.toLowerCase().includes('plaza') || 
    stop.name.toLowerCase().includes('mall')
  ).length;
  const strategic = geofences.filter(stop => 
    stop.name.toLowerCase().includes('hospital') || 
    stop.name.toLowerCase().includes('universidad') || 
    stop.name.toLowerCase().includes('aeropuerto')
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {error ? (
        <div className="text-red-600 p-4 text-center">
          {error}
          <button 
            onClick={fetchGeofences}
            className="ml-4 text-blue-600 underline"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Catálogo de Puntos de Control</h2>
            <p className="text-gray-600">Gestión de todas las paradas del sistema de transporte</p>
          </div>

          {/* Tabla de puntos de control */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {geofences.map((stop) => {
                    const stopType = getStopType(stop.name);
                    return (
                      <tr key={stop.idgeo} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{stop.name}</span>
                            <span className="text-xs text-gray-500">({stop.shortName})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {getAddressFromCoordinates(stop.coordinates)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(stopType)}`}>
                            {stopType}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                          <div className="flex justify-center space-x-3">
                            <button 
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              onClick={() => handleViewClick(stop)}
                              title="Ver detalles"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                              onClick={() => handleEditClick(stop)}
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 transition-colors"
                              onClick={() => handleDeleteStop(stop.idgeo)}
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Resumen de estadísticas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total de Paradas</p>
              <p className="text-2xl font-bold text-gray-900">{totalStops}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600">Terminales</p>
              <p className="text-2xl font-bold text-blue-700">{terminals}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600">Paradas Comerciales</p>
              <p className="text-2xl font-bold text-green-700">{commercial}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-600">Puntos Estratégicos</p>
              <p className="text-2xl font-bold text-purple-700">{strategic}</p>
            </div>
          </div>

          {/* Botón para agregar nuevo punto de control */}
          <div className="mt-6 flex justify-end">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              onClick={() => {
                setSelectedEditStop(null);
                setEditModalVisible(true);
              }}
            >
              <MapPin className="w-4 h-4" />
              Agregar Punto de Control
            </button>
          </div>

          {/* Modal para crear/editar punto de control */}
          <Modal
            title={selectedEditStop ? 'Editar Punto de Control' : 'Crear Punto de Control'}
            open={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setSelectedEditStop(null);
            }}
            footer={null}
            width={600}
          >
            <StopForm
              initialValues={selectedEditStop || undefined}
              onSubmit={selectedEditStop ? handleUpdateStop : handleCreateStop}
              loading={formLoading}
            />
          </Modal>

          {/* Modal para ver la geocerca en el mapa */}
          <Modal
            title={`Vista de Geocerca: ${selectedViewStop?.name}`}
            open={viewModalVisible}
            onCancel={() => {
              setViewModalVisible(false);
              setSelectedViewStop(null);
            }}
            footer={null}
            width={800}
            styles={{ body: { padding: 0 } }}
          >
            {selectedViewStop && (
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Tipo de Geocerca:</span> {selectedViewStop.tipogeo === 1 ? 'Circular' : 'Poligonal'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Coordenadas:</span> {getAddressFromCoordinates(selectedViewStop.coordinates)}
                  </p>
                </div>
                <div className="relative" style={{ height: '400px', zIndex: 1 }}>
                  <GeofenceMap 
                    key={selectedViewStop.idgeo}
                    coordinates={selectedViewStop.coordinates}
                    tipogeo={selectedViewStop.tipogeo === 1 ? 'Circular' : 'Poligonal'}
                  />
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}; 