import React, { useState, useEffect } from 'react';

// Definir los tipos de las props
interface MyComponentProps {
  idusu: string; // Ajusta los tipos según los datos que esperes
  idcliente: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ idusu, idcliente }) => {
  const [modalState, setModalState] = useState(false);
  const [openModal, setOpenModal] = useState('');
  const [refetchModalData, setRefetchModalData] = useState(false);
  const [vehiclesData, setVehiclesData] = useState<any[]>([]); // Estado para los datos del modal

  // Función para obtener los datos desde la API
  const fetchVehiclesData = async () => {
    try {
      const response = await fetch(
        `https://test.tcvsat.com.mx/tcvback/v3/api/get/units/rutabus`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idusu,
            idcliente,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error fetching data');
      }

      const data = await response.json();
      setVehiclesData(data); // Asume que la respuesta es un array de vehículos
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
  };

  // Llama a `fetchVehiclesData` cada vez que se abra el modal
  useEffect(() => {
    if (openModal === 'vehiclesModal') {
      fetchVehiclesData();
    }
  }, [openModal, refetchModalData]);

  // Configuración de los modales
  const Modals: any = {
    vehiclesModal: (
      <AsyncModal
        state={modalState}
        dataSource={vehiclesData} // Aquí pasamos los datos obtenidos
        title="Vehículos seleccionados"
        element="vehiculo"
        apiElement="name"
        itemsPerPage={20}
        maxItemsToSelect={25}
        action={onCreateVehicles} // Asegúrate de definir esta función
        avoidElements={[]}
        refetchData={refetchModalData}
        selectedItems={[]}
        haveLimitToSelect
        dataKey=""
        extraParams={{}}
        vehicleLink={[]}
        vehicleLinkConfig={{}}
        isGetVehicles
      />
    ),
  };

  // Botón para abrir el modal
  return (
    <>
      <button
        onClick={() => {
          setModalState(true);
          setOpenModal('vehiclesModal');
        }}
      >
        Abrir Modal de Vehículos
      </button>
      {Modals[openModal]}
    </>
  );
};

export default MyComponent;
