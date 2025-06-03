import React, { useState } from 'react';
import { Form, Input, Select, Button } from 'antd';
import type { VehicleFormData, SavedVehicle } from '../types';

interface VehicleFormProps {
  initialValues?: SavedVehicle;
  onSubmit: (values: VehicleFormData) => Promise<void>;
}

const vehicleTypes = [
  { label: 'Sprinter', value: 'Sprinter' },
  { label: 'Microbus', value: 'Microbus' },
  { label: 'Autobús', value: 'Autobús' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => currentYear - i).map(year => ({
  label: year.toString(),
  value: year,
}));

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialValues,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: VehicleFormData) => {
    setLoading(true);
    try {
      await onSubmit(values);
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        imei: initialValues?.imei || '',
        nombre_plataforma: initialValues?.plataform_name || '',
        nombre_corto: initialValues?.short_name || '',
        tipo: initialValues?.tipo || undefined,
        año: initialValues?.año || undefined,
      }}
    >
      <Form.Item
        label="IMEI"
        name="imei"
        rules={[
          { required: true, message: 'Por favor ingrese el IMEI' },
          { min: 15, max: 15, message: 'El IMEI debe tener 15 dígitos' },
          { pattern: /^\d+$/, message: 'El IMEI solo debe contener números' },
        ]}
      >
        <Input placeholder="Ej: 123456789012345" maxLength={15} />
      </Form.Item>

      <Form.Item
        label="Nombre de la Unidad"
        name="nombre_plataforma"
        rules={[{ required: true, message: 'Por favor ingrese el nombre de la unidad' }]}
      >
        <Input placeholder="Ej: Unidad 001" />
      </Form.Item>

      <Form.Item
        label="Nombre Corto"
        name="nombre_corto"
        rules={[{ required: true, message: 'Por favor ingrese el nombre corto' }]}
      >
        <Input placeholder="Ej: U001" />
      </Form.Item>

      <Form.Item
        label="Tipo de Unidad"
        name="tipo"
        rules={[{ required: true, message: 'Por favor seleccione el tipo de unidad' }]}
      >
        <Select
          options={vehicleTypes}
          placeholder="Seleccione el tipo de unidad"
        />
      </Form.Item>

      <Form.Item
        label="Año"
        name="año"
        rules={[{ required: true, message: 'Por favor seleccione el año' }]}
      >
        <Select
          options={years}
          placeholder="Seleccione el año"
        />
      </Form.Item>

      <div className="flex justify-end space-x-4">
        <Button onClick={() => form.resetFields()}>
          Limpiar
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </Form>
  );
}; 