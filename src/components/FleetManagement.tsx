import React, { useState, useEffect } from 'react';
import { message, Modal, Table } from 'antd';
import { Eye, Edit2, Trash2, Plus, FileUp } from 'lucide-react';
import { getSavedRutabusVehicles, insertVehicles, updateVehicles, deleteVehicles } from '../api/Apis';
import type { SavedVehicle, VehicleFormData } from '../types/vehicle';
import { VehicleForm } from './VehicleForm';
import { PlatformVehiclesTable } from './PlatformVehiclesTable';

interface FleetManagementProps {
  idcliente: string;
  idusu: string;
}

export const FleetManagement: React.FC<FleetManagementProps> = ({ idcliente, idusu }) => {
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<SavedVehicle | null>(null);
  const [additionMode, setAdditionMode] = useState<'manual' | 'platform'>('manual');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await getSavedRutabusVehicles(idcliente);
      console.log('API Response:', response);
      if (response?.datos) {
        setVehicles(response.datos);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      message.error('Error al cargar las unidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [idcliente]);

  const columns = [
    {
      title: 'ID Unidad',
      dataIndex: 'short_name',
      key: 'short_name',
      className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text || 'Sin asignar'}</span>
      ),
    },
    {
      title: 'Nombre',
      dataIndex: 'plataform_name',
      key: 'plataform_name',
      className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      render: (_: string, record: SavedVehicle) => (
        <span className="text-sm text-gray-600">
          {record.tipo || 'Sin asignar'}
        </span>
      ),
    },
    {
      title: 'Ruta Asignada',
      dataIndex: 'rutas_nombres',
      key: 'rutas_nombres',
      className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      render: (rutas: string[]) => {
        if (!rutas || rutas.length === 0) return 'Pendiente de asignar';
        const ruta = rutas[0];
        return ruta.includes('no encontrada') ? 'Pendiente de asignar' : ruta;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      render: (estado: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          estado === 'completo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {estado === 'completo' ? 'Activo' : 'Parcial'}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      render: (_: unknown, record: SavedVehicle) => (
        <div className="flex space-x-4">
          <button 
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            className="text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => handleEditVehicle(record)}
            title="Editar unidad"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button 
            className="text-red-600 hover:text-red-900 transition-colors"
            onClick={() => handleDeleteVehicle(record.imei)}
            title="Eliminar unidad"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setModalVisible(true);
  };

  const handleEditVehicle = (vehicle: SavedVehicle) => {
    setEditingVehicle(vehicle);
    setModalVisible(true);
  };

  const handleDeleteVehicle = async (imei: string) => {
    try {
      await deleteVehicles([imei]);
      message.success('Unidad eliminada correctamente');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      message.error('Error al eliminar la unidad');
    }
  };

  const handleSaveVehicle = async (values: VehicleFormData) => {
    try {
      if (editingVehicle) {
        await updateVehicles([{
          imei: values.imei,
          nombre_plataforma: values.nombre_plataforma,
          nombre_corto: values.nombre_corto,
          idcliente: values.idcliente,
        }]);
        message.success('Unidad actualizada correctamente');
      } else {
        await insertVehicles([{
          imei: values.imei,
          nombre_plataforma: values.nombre_plataforma,
          nombre_corto: values.nombre_corto,
          idcliente: values.idcliente,
        }]);
        message.success('Unidad agregada correctamente');
      }
      setModalVisible(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      message.error('Error al guardar la unidad');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Catálogo de Flota</h2>
        <p className="text-gray-600">Gestión completa de todas las unidades de transporte</p>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={vehicles}
          loading={loading}
          rowKey="imei"
          pagination={{ pageSize: 10 }}
          className="w-full border-collapse bg-white"
          rowClassName={() => 'hover:bg-gray-50'}
        />
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => {
            setAdditionMode('manual');
            handleAddVehicle();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Nueva Unidad
        </button>
        <button
          onClick={() => {
            setAdditionMode('platform');
            handleAddVehicle();
          }}
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          <FileUp className="w-5 h-5" />
          Importar desde Plataforma
        </button>
      </div>

      <Modal
        title={editingVehicle ? 'Editar Unidad' : 'Agregar Nueva Unidad'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {additionMode === 'manual' ? (
          <VehicleForm
            initialValues={editingVehicle || undefined}
            onSubmit={handleSaveVehicle}
          />
        ) : (
          <PlatformVehiclesTable
            idcliente={idcliente}
            idusu={idusu}
            onSave={handleSaveVehicle}
            onSelectedVehiclesChange={() => {}}
          />
        )}
      </Modal>
    </div>
  );
}; 