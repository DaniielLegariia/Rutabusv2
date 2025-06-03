import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import type { VehicleFromPlatform, VehicleFormData } from '../types/vehicle';
import { getPlatformVehicles } from '../api/Apis';

interface PlatformVehiclesTableProps {
  idcliente: string;
  idusu: string;
  onSave: (values: VehicleFormData) => Promise<void>;
  onSelectedVehiclesChange: (vehicles: VehicleFromPlatform[]) => void;
}

export const PlatformVehiclesTable: React.FC<PlatformVehiclesTableProps> = ({
  idcliente,
  idusu,
  onSave,
  onSelectedVehiclesChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleFromPlatform[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchPlatformVehicles = async () => {
    setLoading(true);
    try {
      const data = await getPlatformVehicles(idcliente, idusu);
      if (Array.isArray(data)) {
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching platform vehicles:', error);
      message.error('Error al cargar las unidades de la plataforma');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformVehicles();
  }, [idcliente, idusu]);

  useEffect(() => {
    const selectedVehicles = vehicles.filter(v => 
      selectedRowKeys.includes(v.IMEI)
    );
    onSelectedVehiclesChange(selectedVehicles);
  }, [selectedRowKeys, vehicles, onSelectedVehiclesChange]);

  const columns = [
    {
      title: 'ID GPS',
      dataIndex: 'IDGPS',
      key: 'IDGPS',
    },
    {
      title: 'Nombre',
      dataIndex: 'NOMBRE',
      key: 'NOMBRE',
    },
    {
      title: 'IMEI',
      dataIndex: 'IMEI',
      key: 'IMEI',
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const handleSave = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Por favor seleccione al menos una unidad');
      return;
    }

    const selectedVehicle = vehicles.find(v => v.IMEI === selectedRowKeys[0]);
    if (selectedVehicle) {
      await onSave({
        imei: selectedVehicle.IMEI,
        nombre_plataforma: selectedVehicle.NOMBRE,
        nombre_corto: '',
        idcliente: selectedVehicle.ID_CLIENTE.toString(),
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-600">
          Seleccione las unidades que desea importar desde la plataforma
        </p>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={vehicles}
        loading={loading}
        rowKey="IMEI"
        pagination={{ pageSize: 5 }}
      />

      <div className="flex justify-end mt-4">
        <Button
          type="primary"
          onClick={handleSave}
          disabled={selectedRowKeys.length === 0}
        >
          Importar Seleccionados ({selectedRowKeys.length})
        </Button>
      </div>
    </div>
  );
}; 