import React from 'react';
import { Form, Input, TimePicker, Switch, InputNumber, Button, Table } from 'antd';
import type { RouteFormData, RouteApiData } from '../types';
import { transformRouteToApiData } from '../utils/apiTransform';

interface RouteFormProps {
  initialValues?: Partial<RouteFormData>;
  onSubmit: (values: Omit<RouteApiData, 'id'>) => Promise<void>;
  loading: boolean;
}

export const RouteForm: React.FC<RouteFormProps> = ({
  initialValues,
  onSubmit,
  loading
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: RouteFormData) => {
    const routeData = transformRouteToApiData(values);
    await onSubmit(routeData);
  };

  const stepsColumns = [
    {
      title: 'Nombre',
      dataIndex: 'Name',
      key: 'Name',
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          name={['steps', index, 'Name']}
          rules={[{ required: true, message: 'El nombre es requerido' }]}
          noStyle
        >
          <Input placeholder="Nombre de la parada" />
        </Form.Item>
      ),
    },
    {
      title: 'Nombre Corto',
      dataIndex: 'ShortName',
      key: 'ShortName',
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          name={['steps', index, 'ShortName']}
          rules={[{ required: true, message: 'El nombre corto es requerido' }]}
          noStyle
        >
          <Input placeholder="Nombre corto" />
        </Form.Item>
      ),
    },
    {
      title: 'Coordenadas',
      dataIndex: 'Coordinates',
      key: 'Coordinates',
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          name={['steps', index, 'Coordinates']}
          rules={[{ required: true, message: 'Las coordenadas son requeridas' }]}
          noStyle
        >
          <Input placeholder="Lat, Long" />
        </Form.Item>
      ),
    },
    {
      title: 'Tiempo a Destino (min)',
      dataIndex: ['Config', 'MinutesToDestination'],
      key: 'MinutesToDestination',
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          name={['steps', index, 'Config', 'MinutesToDestination']}
          rules={[{ required: true, message: 'El tiempo es requerido' }]}
          noStyle
        >
          <InputNumber min={0} />
        </Form.Item>
      ),
    },
    {
      title: 'Tiempo en Sección (min)',
      dataIndex: ['Config', 'tolerance', 'SectionTime'],
      key: 'SectionTime',
      render: (_: unknown, __: unknown, index: number) => (
        <Form.Item
          name={['steps', index, 'Config', 'tolerance', 'SectionTime']}
          rules={[{ required: true, message: 'El tiempo es requerido' }]}
          noStyle
        >
          <InputNumber min={0} />
        </Form.Item>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="Nombre de la Ruta"
        rules={[{ required: true, message: 'Por favor ingresa el nombre de la ruta' }]}
      >
        <Input placeholder="Ej: Ruta Norte - Ejecutiva" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Descripción"
      >
        <Input.TextArea placeholder="Describe la ruta..." />
      </Form.Item>

      <Form.Item
        name="toleranceOnTime"
        label="Tolerancia A Tiempo (minutos)"
        rules={[{ required: true }]}
      >
        <InputNumber min={0} />
      </Form.Item>

      <Form.Item
        name="toleranceDelay"
        label="Tolerancia Retraso (minutos)"
        rules={[{ required: true }]}
      >
        <InputNumber min={0} />
      </Form.Item>

      <Form.Item
        name="disassociateVehicle"
        valuePropName="checked"
        label="Desasociar Vehículo Automáticamente"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.disassociateVehicle !== currentValues.disassociateVehicle
        }
      >
        {({ getFieldValue }) =>
          getFieldValue('disassociateVehicle') ? (
            <>
              <Form.Item
                name="disassociateVehicleTrigger"
                label="Trigger de Desasociación"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="disassociateVehicleTime"
                label="Tiempo de Referencia"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} />
              </Form.Item>
            </>
          ) : null
        }
      </Form.Item>

      <Form.Item
        name="finalDestinationAuto"
        valuePropName="checked"
        label="Destino Final Automático"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.finalDestinationAuto !== currentValues.finalDestinationAuto
        }
      >
        {({ getFieldValue }) =>
          !getFieldValue('finalDestinationAuto') ? (
            <Form.Item
              name="finalDestination"
              label="Hora de Destino Final"
              rules={[{ required: true }]}
            >
              <TimePicker format="HH:mm" />
            </Form.Item>
          ) : null
        }
      </Form.Item>

      <Form.List name="steps" initialValue={[{}]}>
        {(fields, { add }) => (
          <>
            <Table
              dataSource={fields}
              columns={stepsColumns}
              pagination={false}
              rowKey="key"
            />
            <Button type="dashed" onClick={() => add()} block className="mt-4">
              + Agregar Parada
            </Button>
          </>
        )}
      </Form.List>

      <Form.Item className="mt-6">
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? 'Actualizar Ruta' : 'Crear Ruta'}
        </Button>
      </Form.Item>
    </Form>
  );
}; 