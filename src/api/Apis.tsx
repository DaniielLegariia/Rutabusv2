import { message } from 'antd';
import axios from 'axios';

const API_BASE_URL = 'https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/units';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'IftJrNch63rbat4IX8kmSXgfnX8A9F9OZw559_8varaljhDFSDmnaDkmwviqdHCnHpFTKFHd8ZptVo3p'
};

export const insertVehicles = async (registros: any[]) => {
  try {
    const body = {
        registros: registros.map((registro) => ({
          imei: registro.imei,
          nombre_plataforma: registro.nombre_plataforma,
          nombre_corto: registro.nombre_corto,
          idcliente: registro.idcliente,
        })),
      };

    const response = await fetch(`${API_BASE_URL}/insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body }),
    });

    if (response.ok) {
      message.success('Vehículos guardados correctamente');
    } else {
      console.log('Error:', response);
      message.error('Error al guardar los vehículos');
    }
  } catch (error) {
    console.log('Error:', error);
    message.error('Error al guardar los vehículos');
  }
};

export const deleteVehicles = async (imeis: string[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ imeis }),
    });

    if (response.ok) {
      message.success('Vehículos eliminados correctamente');
    } else {
      message.error('Error al eliminar los vehículos');
    }
  } catch (error) {
    message.error('Error al eliminar los vehículos');
  }
};

export const disassociateVehicles = async ({ imeis, idruta }: { imeis: string[]; idruta: string }) => {
  try {
    const response = await fetch(`https://mlujjag146.execute-api.us-east-1.amazonaws.com/test/units/disassociate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imeis, idruta }),
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorBody = await response.json(); // Obtener el cuerpo del error
      throw new Error(errorBody.message || 'Error al desvincular los vehículos');
    }

    // Parsear el cuerpo de la respuesta
    const responseBody = await response.json();
    return responseBody; // Devolver el cuerpo de la respuesta
  } catch (error) {
    console.error('Error en disassociateVehicles:', error);
    throw error; // Lanzar el error para que sea manejado por el código que llama a esta función
  }
};

export const updateVehicles = async (registros: any[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registros }),
    });

    // Procesar la respuesta
    const responseBody = await response.json();

    if (response.ok) {
      return responseBody; // Devolver el cuerpo de la respuesta en caso de éxito
    } else {
      // Lanzar un error con el mensaje del backend
      throw new Error(responseBody?.body?.message || 'Error al actualizar los vehículos');
    }
  } catch (error) {
    console.error('Error en updateVehicles:', error);
    throw error; // Lanzar el error para que sea manejado por el código que llama a esta función
  }
};

export const getSavedRutabusVehicles = async (idcliente: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/list?idcliente=${idcliente}`, {
        method: 'GET',
        headers,
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.body; // Asegúrate de devolver el cuerpo de la respuesta
      } else {
        message.error('Error al obtener los vehículos guardados');
        return { data: [] }; // Devuelve un objeto con una propiedad `data` vacía en caso de error
      }
    } catch (error) {
      message.error('Error al obtener los vehículos guardados');
      return { data: [] }; // Devuelve un objeto con una propiedad `data` vacía en caso de error
    }
  };

export const getVehicles = async (
    page: number = 1,
    limit: number = 500,
    tcvUserId: string,
    idcliente: string,
    setVehiclesFromApi: Function,
    setVehiclesData: Function,
    showLoading: Function,
    hideLoading: Function,
    filterFunction?: (vehicles: any[]) => any[] // Nueva función de filtrado opcional
  ) => {
    try {
      showLoading(`Cargando vehículos... Página ${page}`);
      const response = await fetch(
        `https://test.tcvsat.com.mx/tcvback/v3/api/get/units/rutabus?idusu=${tcvUserId}&idcliente=${idcliente}&page=${page}&limit=${limit}`
      );
      const data = await response.json();
  
      if (data.length === 0) {
        hideLoading();
        message.success('Todos los vehículos cargados correctamente');
        return;
      }
  
      // Aplicar la función de filtrado si está definida
      const filteredData = filterFunction ? filterFunction(data) : data;
  
      // Agregar los datos obtenidos a vehiclesFromApi
      setVehiclesFromApi((prevData: any) => [...prevData, ...filteredData]);
  
      // Transformar los datos y sincronizar con vehiclesData
      const transformedData = filteredData.map((item: any) => ({
        id: item.IDGPS,
        name: item.NOMBRE, // Mapea "NOMBRE" a "name" para que el modal pueda usarlo.
        idUnidad: item.ID_UNIDAD,
        imei: item.IMEI,
        idCliente: item.ID_CLIENTE,
      }));
      setVehiclesData((prevData: any) => [...prevData, ...transformedData]);
  
      // Llamar recursivamente para obtener la siguiente página solo si hay más datos
      if (data.length === limit) {
        getVehicles(page + 1, limit, tcvUserId, idcliente, setVehiclesFromApi, setVehiclesData, showLoading, hideLoading, filterFunction);
      } else {
        hideLoading();
        message.success('Todos los vehículos cargados correctamente');
      }
    } catch (error) {
      hideLoading();
      message.error('Error al obtener los vehículos');
    }
};

export const getGeofences = async (idcliente: string, idusu: string) => {
  try {
    const response = await fetch(
      `https://test.tcvsat.com.mx/tcvback/v3/api/get/geocercas/rutabus?idcliente=${idcliente}&idusu=${idusu}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export const getListGeofences = async (idcliente: string) => {
  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/geocercas/get-list?idcliente=${idcliente}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export const insertGeofence = async (idgeo: number, name: string, shortName: string, idcliente: string, sectionTime: number, transitSectionTime: number, coordinates: string, tipogeo: number) => {
  const geofence = {
    idgeo,
    name,
    shortName,
    idcliente,
    sectionTime,
    transitSectionTime,
    coordinates,
    tipogeo
  };

  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/geocercas/insert`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geofence),
      }
    );
    return response;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const updateGeofence = async (idgeo: string, name: string, shortname: string, sectiontime: number, transitsectiontime: number, idcliente: string) => {
  const geofence = {
    idgeo,
    name,
    shortname,
    sectiontime,
    transitsectiontime,
    idcliente
  };

  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/geocercas/update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geofence),
      }
    );
    return response;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const deleteGeofence = async (idgeo: number, idcliente: number) => {
  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/geocercas/delete`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idgeo, idcliente }),
      }
    );

    // Verifica si el estado HTTP es exitoso
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parsear el cuerpo de la respuesta como JSON
    const data = await response.json();
    return data; // Devuelve el cuerpo de la respuesta parseado
  } catch (error) {
    console.error('Error:', error);
    throw error; // Lanza el error para que pueda ser manejado por el llamador
  }
};

export const insertRoute = async (registros: any[]) => {
  console.log("registros", registros);
  try {
    const response = await fetch(`https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/rutas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Agrega otros encabezados si son necesarios, como tokens de autenticación
      },
      body: JSON.stringify({ registros }),
    });

    // Devuelve la respuesta para que pueda ser evaluada
    return response;
  } catch (error) {
    console.error('Error al crear la ruta:', error);
    throw error; // Lanza el error para que pueda ser manejado en `handleOnSave`
  }
};


export const getListRutas = async (idcliente: number) => {
  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/rutas?idcliente=${idcliente}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const DeleteRoute = async (id: number, idcliente: number) => {
  try{
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/test/rutas`,
      {
        method: 'DELETE',
        body: JSON.stringify({ id, idcliente }),
      }
      );
      const data= await response.json();
      return data;
  }catch(error){
    console.error('Error:', error);
    return null;
  }
};

export const getRoute = async (id: number, idcliente: number) => {
  try{
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/rutas/${id}?idcliente=${idcliente}`
    );
    const data= await response.json();
    return data;
  }catch(error){
    console.error('Error:', error);
    return null;
  }
}

export const updateRoute = async (
  id: number,
  idcliente: number,
  registros: { Name: string; Description: string; tolerance: any; dissociate: any; FinalDestination: any; steps: any[] }
) => {
  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/rutas`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, idcliente, registros }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en la API:', errorData);
      throw new Error(`Error en la API: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error al actualizar la ruta:', error);
    throw error;
  }
};

export const getListAvailableUnits = async (idcliente: string) => {
  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/units/list?idcliente=${idcliente}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export const getListAssignedUnits = async (idcliente: string, idruta: number) => {
  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/test/rutas/get/units?idcliente=${idcliente}&idruta=${idruta}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return error;
  }
}

export const setUnitToRoute = async (idcliente: string, idruta: string, unit: any[]) => {
  try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/rutabus/rutas/unit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idcliente, idruta, unit }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const data = await response.json(); // Procesar el cuerpo de la respuesta
    return data; // Devolver el cuerpo de la respuesta
  } catch (error) {
    console.error('Error:', error);
    throw error; // Lanzar el error para manejarlo en el componente
  }
};


export const getLastEventUnits = async (idcliente: string[]) => {
   try {
    const response = await fetch(
      `https://mlujjag146.execute-api.us-east-1.amazonaws.com/test/units/last-status?id_cliente=${idcliente}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}