import React, { useState } from 'react';
import { Form, Input, Button, Space, InputNumber, Radio, message } from 'antd';
import { GeofenceMap } from './GeofenceMap';
import { MapPin, Move, Circle, Search, MapIcon, Crosshair } from 'lucide-react';
import type { GeofenceFormValues } from '../types';
import type { GeofenceInsertData } from '../api/Apis';

interface StopFormProps {
  initialValues?: Partial<GeofenceFormValues>;
  onSubmit: (values: GeofenceInsertData) => Promise<void>;
  loading?: boolean;
}

interface ApiResponse {
  statusCode: number;
  body: {
    error?: string;
    message?: string;
    requiredFields?: string[];
  };
}

export const StopForm: React.FC<StopFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm<GeofenceFormValues>();
  const [showMap, setShowMap] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState(initialValues?.coordinates || '');
  const [currentGeofenceType, setCurrentGeofenceType] = useState<1 | 2>(1); // 1: Circular, 2: Poligonal
  const [radius, setRadius] = useState(initialValues?.radius || 500);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [locationType, setLocationType] = useState<'map' | 'address' | 'coordinates'>('map');
  const [searchAddress, setSearchAddress] = useState('');
  const [manualCoordinates, setManualCoordinates] = useState('');

  const generateRandomId = () => {
    return Math.floor(Math.random() * (999999 - 1000 + 1)) + 1000;
  };

  const handleMapEdit = (newCoordinates: string, newRadius?: number) => {
    setCurrentCoordinates(newCoordinates);
    form.setFieldsValue({ coordinates: newCoordinates });
    
    if (newRadius) {
      setRadius(Math.round(newRadius));
      form.setFieldsValue({ radius: Math.round(newRadius) });
    }
  };

  const handleRadiusChange = (value: number | null) => {
    if (!value) return;
    setRadius(value);
    if (center) {
      const coords = `${center[0]}|${center[1]}`;
      setCurrentCoordinates(coords);
      form.setFieldsValue({ coordinates: coords });
    }
  };

  const handleAddressSearch = async () => {
    try {
      // Aquí implementaremos la búsqueda de dirección usando una API de geocodificación
      // Por ahora es un placeholder
      message.info('Función de búsqueda por dirección próximamente disponible');
    } catch {
      message.error('Error al buscar la dirección');
    }
  };

  const handleCoordinatesInput = () => {
    try {
      const [lat, lng] = manualCoordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (isNaN(lat) || isNaN(lng)) {
        message.error('Por favor ingrese coordenadas válidas (lat,lng)');
        return;
      }
      setCurrentCoordinates(`${lat}|${lng}`);
      form.setFieldsValue({ coordinates: `${lat}|${lng}` });
      setCenter([lat, lng]);
    } catch {
      message.error('Por favor ingrese coordenadas válidas (lat,lng)');
    }
  };

  const handleSubmit = async (values: GeofenceFormValues) => {
    const randomId = generateRandomId();
    const submitValues: GeofenceInsertData = {
      idgeo: randomId,
      name: values.name,
      shortName: values.shortName,
      idcliente: "110",
      sectionTime: 0,
      transitSectionTime: 0,
      coordinates: currentCoordinates,
      tipogeo: currentGeofenceType,
      radius: currentGeofenceType === 1 ? radius : undefined
    };

    try {
      const response = await onSubmit(submitValues);
      const apiResponse = response as unknown as ApiResponse;
      
      if (apiResponse.statusCode >= 400) {
        message.error(apiResponse.body.message || 'Error al crear la geocerca');
        if (apiResponse.body.requiredFields) {
          message.warning(`Campos requeridos: ${apiResponse.body.requiredFields.join(', ')}`);
        }
      } else {
        message.success('Geocerca creada exitosamente');
      }
    } catch {
      message.error('Error al crear la geocerca');
    }
  };

  const handleCenterUpdate = (newCenter: [number, number]) => {
    setCenter(newCenter);
  };

  // Estilos personalizados para los botones
  const buttonStyle = {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
    color: 'white',
    ':hover': {
      backgroundColor: '#40a9ff',
      borderColor: '#40a9ff',
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        name: initialValues?.name || '',
        shortName: initialValues?.shortName || '',
        tipogeo: 1,
        coordinates: initialValues?.coordinates || '',
        radius: initialValues?.radius || 500
      }}
    >
      <Form.Item
        label="Nombre del Punto de Control"
        name="name"
        rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
      >
        <Input placeholder="Ej: Terminal Central" />
      </Form.Item>

      <Form.Item
        label="Nombre Corto"
        name="shortName"
        rules={[{ required: true, message: 'Por favor ingrese el nombre corto' }]}
      >
        <Input placeholder="Ej: TC" />
      </Form.Item>

      <Form.Item
        label="Tipo de Geocerca"
        name="tipogeo"
      >
        <Radio.Group 
          onChange={(e) => setCurrentGeofenceType(e.target.value)} 
          value={currentGeofenceType}
        >
          <Radio value={1}>Circular</Radio>
          <Radio value={2}>Poligonal</Radio>
        </Radio.Group>
      </Form.Item>

      {currentGeofenceType === 1 && (
        <Form.Item
          label="Radio de la Geocerca (metros)"
          name="radius"
          rules={[{ required: true, message: 'Por favor especifique el radio' }]}
        >
          <InputNumber
            min={10}
            max={10000}
            step={10}
            style={{ width: '100%' }}
            onChange={handleRadiusChange}
            addonAfter="metros"
          />
        </Form.Item>
      )}

      <Form.Item label="Método de ubicación">
        <Radio.Group value={locationType} onChange={(e) => setLocationType(e.target.value)}>
          <Space direction="vertical">
            <Radio value="map">
              <Space>
                <MapIcon className="w-4 h-4" />
                Seleccionar en el mapa
              </Space>
            </Radio>
            <Radio value="address">
              <Space>
                <Search className="w-4 h-4" />
                Buscar por dirección
              </Space>
            </Radio>
            <Radio value="coordinates">
              <Space>
                <Crosshair className="w-4 h-4" />
                Ingresar coordenadas
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      {locationType === 'address' && (
        <Form.Item label="Dirección">
          <Space.Compact style={{ width: '100%' }}>
            <Input 
              placeholder="Ingrese una dirección" 
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <Button type="primary" onClick={handleAddressSearch}>
              Buscar
            </Button>
          </Space.Compact>
        </Form.Item>
      )}

      {locationType === 'coordinates' && (
        <Form.Item label="Coordenadas (latitud, longitud)">
          <Space.Compact style={{ width: '100%' }}>
            <Input 
              placeholder="Ej: 19.4326, -99.1332" 
              value={manualCoordinates}
              onChange={(e) => setManualCoordinates(e.target.value)}
            />
            <Button type="primary" onClick={handleCoordinatesInput}>
              Ir a ubicación
            </Button>
          </Space.Compact>
        </Form.Item>
      )}

      <Form.Item
        label="Coordenadas"
        name="coordinates"
        rules={[{ required: true, message: 'Las coordenadas son requeridas' }]}
      >
        <Input.TextArea 
          rows={2} 
          readOnly 
          placeholder="Las coordenadas se generarán automáticamente al dibujar en el mapa"
        />
      </Form.Item>

      <div className="mb-4">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary"
            icon={<MapPin className="w-4 h-4" />}
            onClick={() => setShowMap(!showMap)}
            block
            style={buttonStyle}
          >
            {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
          </Button>
          {showMap && (
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
              {currentGeofenceType === 1 ? (
                <>
                  <p className="font-medium mb-2">Instrucciones para geocerca circular:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Haz clic en el mapa para establecer el centro de la geocerca</li>
                    <li>Ajusta el radio usando el control numérico o arrastrando el borde del círculo</li>
                    <li>Puedes mover el centro haciendo clic en otra ubicación</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-medium mb-2">Instrucciones para geocerca poligonal:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Haz clic en el mapa para agregar cada punto del polígono</li>
                    <li>Necesitas al menos 3 puntos para formar un polígono</li>
                    <li>Los puntos se conectarán en el orden que los agregues</li>
                  </ol>
                </>
              )}
            </div>
          )}
        </Space>
      </div>

      {showMap && (
        <div className="mb-4 border rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <Space>
              <Button 
                type="primary"
                onClick={() => setEditMode(!editMode)}
                icon={editMode ? <Move className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                style={buttonStyle}
              >
                {editMode ? 'Finalizar Edición' : 'Editar Geocerca'}
              </Button>
              {editMode && (
                <span className="text-sm text-gray-600">
                  {currentGeofenceType === 1
                    ? 'Haz clic para establecer el centro y ajusta el radio con el control o arrastrando' 
                    : 'Haz clic para agregar puntos al polígono'}
                </span>
              )}
            </Space>
          </div>
          <GeofenceMap
            coordinates={currentCoordinates}
            tipogeo={currentGeofenceType === 1 ? 'Circular' : 'Poligonal'}
            editable={editMode}
            radius={radius}
            onCoordinatesChange={handleMapEdit}
            onCenterUpdate={handleCenterUpdate}
          />
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          style={buttonStyle}
        >
          {initialValues ? 'Guardar Cambios' : 'Crear Punto de Control'}
        </Button>
      </div>
    </Form>
  );
}; 