import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_ENDPOINT = 'http://localhost:8080/api';

function MensajerosList() {
    const [listadoMensajeros, setListadoMensajeros] = useState([]);
    
    // Estados para la gestión de la interfaz
    const [estaCargandoDatos, setEstaCargandoDatos] = useState(true);
    const [avisoError, setAvisoError] = useState(null);
    const [avisoExito, setAvisoExito] = useState(null); 
    
    // Clave para forzar la recarga de datos tras una acción
    const [contadorRecarga, setContadorRecarga] = useState(0);

    // ----------------------------------------------------
    // Lógica para obtener el listado de mensajeros (GET)
    // ----------------------------------------------------
    const obtenerListado = useCallback(async () => {
        setEstaCargandoDatos(true);
        setAvisoError(null);
        try {
            const respuesta = await axios.get(`${API_BASE_ENDPOINT}/mensajeros`);
            setListadoMensajeros(respuesta.data);
        } catch (error) {
            console.error('Error al obtener la lista de mensajeros:', error);
            setAvisoError('Fallo al cargar la lista. Asegúrese de que el backend esté en funcionamiento.');
        } finally {
            setEstaCargandoDatos(false);
        }
    }, []);

    useEffect(() => {
        obtenerListado();
    }, [obtenerListado, contadorRecarga]);

    // ----------------------------------------------------
    // Manejador para la eliminación (DELETE /api/mensajeros/{id}) 
    // ----------------------------------------------------
    const manejarEliminacion = async (idMensajero) => {
        if (!window.confirm(`¿Está seguro de despedir al mensajero ${idMensajero} y eliminar su registro?`)) {
            return;
        }
        
        setAvisoExito(`Procesando eliminación de ${idMensajero}...`);
        setAvisoError(null);

        try {
            await axios.delete(`${API_BASE_ENDPOINT}/mensajeros/${idMensajero}`);
            
            setAvisoExito(` El mensajero ${idMensajero} ha sido eliminado correctamente del sistema.`);
            
            // OPTIMIZACIÓN: Actualizar la lista sin recargar todos los datos
            setListadoMensajeros(prevList => prevList.filter(m => m.id !== idMensajero));
            
        } catch (error) {
            let mensajeDelServidor = 'Error de conexión con el servicio. Verifique el puerto 8080.';

            if (error.response) {
                // El servidor respondió con un error 4xx o 5xx
                const errorData = error.response.data;
                // Intentamos extraer el mensaje de error del cuerpo de la respuesta del servidor
                mensajeDelServidor = errorData?.message || errorData || `Error del Servidor (${error.response.status}).`;
            }
            
            console.error('Error al eliminar:', error);
            setAvisoError(` Fallo en la eliminación: ${mensajeDelServidor}`);
            setAvisoExito(null); // Limpiar el aviso de proceso/éxito
        }
    };
    
    // ----------------------------------------------------
    // Renderizado (Con Estilos Modernos y Seguridad)
    // ----------------------------------------------------

    return (
        <div className="listado-view-container"> {/* Clase moderna para el contenedor principal */}
            
            {/* Cabecera de la Vista */}
            <div className="view-header">
                <h1 className="view-titulo">Personal de Mensajería Registrado ({listadoMensajeros.length})</h1>
            </div>

            {/* Botones de Acción */}
            <div className="view-acciones-grupo">
                <Link to="/mensajeros/crear" className="btn btn-primary">
                    + Contratar Nuevo Mensajero
                </Link>
            </div>

            {/* Notificaciones (Usando clases de alerta-feedback) */}
            {avisoExito && (
                <div className={`alerta-feedback alerta-success`}>
                    {avisoExito}
                </div>
            )}
            {avisoError && (
                <div className="alerta-feedback alerta-error">
                    {avisoError}
                </div>
            )}

            {/* Renderizado */}
            <div className="card-listado"> {/* Tarjeta para contener la lista */}

                {estaCargandoDatos ? (
                    <div className="loading-state">Cargando información de la plantilla de mensajeros...</div>
                ) : listadoMensajeros.length === 0 ? (
                    <div className="empty-state">Actualmente no hay mensajeros registrados en el sistema.</div>
                ) : (
                    <div className="tabla-responsive">
                        <table className="tabla-logistica"> {/* Clase para la tabla */}
                            <thead>
                                <tr>
                                    <th>ID Mensajero</th>
                                    <th>Nombre Completo</th>
                                    <th>Capacidad</th>
                                    <th>Centro Base</th>
                                    <th>Estado Actual</th>
                                    <th className="th-acciones">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listadoMensajeros.map((mensajero) => (
                                    <tr key={mensajero.id}>
                                        <td>{mensajero.id}</td>
                                        <td>{mensajero.nombre}</td>
                                        <td>{mensajero.capacidad} paquetes</td>
                                        <td>
                                            {/* por seguridad se hace Uso de ?. por si el centro es null */}
                                            <Link to={`/centros/${mensajero.centro?.id}`}>{mensajero.centro || 'N/A'}</Link>
                                        </td>
                                        <td>
                                            {/* por seguridad Si el estado es null, usar un string vacío para toLowerCase */}
                                            <span className={`estado-badge estado-${(mensajero.estado || '').toLowerCase().replace('_', '-')}`}>
                                                {mensajero.estado || '---'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link 
                                                to={`/mensajeros/editar/${mensajero.id}`} 
                                                className="btn btn-sm btn-info" // clase para editar
                                            >
                                                Editar
                                            </Link>
                                            
                                            <button 
                                                onClick={() => manejarEliminacion(mensajero.id)} 
                                                className="btn btn-sm btn-danger ml-10" // Clase  para eliminar
                                                disabled={mensajero.estado !== 'DISPONIBLE'}
                                                title={mensajero.estado !== 'DISPONIBLE' ? 'Solo se puede eliminar si está DISPONIBLE' : 'Eliminar mensajero'}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MensajerosList;