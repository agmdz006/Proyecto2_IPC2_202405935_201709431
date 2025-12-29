
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// URL base de la API para todas las operaciones con paquetes
const URL_BASE = 'http://localhost:8080/api';

function PaquetesList() { 
    const [listaPaquetes, setListaPaquetes] = useState([]);
    
    // Estados para la experiencia del usuario
    const [estaCargando, setEstaCargando] = useState(true);
    const [mensajeError, setMensajeError] = useState(null);
    const [notificacion, setNotificacion] = useState(null);
    
    // forzar la recarga de datos tras una acción (borrado o entrega)
    const [claveRecarga, setClaveRecarga] = useState(0);

    // ----------------------------------------------------
    // Función para obtener la lista de paquetes
    // ----------------------------------------------------
    const obtenerPaquetes = useCallback(async () => {
        setEstaCargando(true);
        setMensajeError(null);
        try {
            // Petición GET al endpoint principal de paquetes
            const respuesta = await axios.get(`${URL_BASE}/paquetes`);
            setListaPaquetes(respuesta.data);
        } catch (error) {
            console.error('Fallo al obtener el listado de paquetes:', error);
            setMensajeError('Error al cargar los paquetes. Verifique la conexión con el servidor backend.');
        } finally {
            setEstaCargando(false);
        }
    }, []);

    // Ejecuta la carga inicial de datos o cuando se fuerza la recarga
    useEffect(() => {
        obtenerPaquetes();
    }, [obtenerPaquetes, claveRecarga]);

    // ----------------------------------------------------
    // Manejador para eliminar un paquete (DELETE /api/paquetes/{id})
    // ----------------------------------------------------
    const manejarEliminacion = async (idPaquete) => {
        if (!window.confirm(`¿Confirma que desea eliminar permanentemente el paquete con ID: ${idPaquete}?`)) {
            return;
        }
        
        setNotificacion(`Intentando eliminar paquete ${idPaquete}...`);

        try {
            // Petición DELETE
            await axios.delete(`${URL_BASE}/paquetes/${idPaquete}`);
            setNotificacion(`Paquete ${idPaquete} eliminado correctamente.`);
            setClaveRecarga(k => k + 1); // Forzar la actualización de la lista
        } catch (error) {
            const mensajeServidor = error.response?.data || 'Hubo un error de conexión.';
            setNotificacion(`Error al eliminar paquete: ${mensajeServidor}`);
        }
    };
    
    const manejarEntrega = async (idPaquete) => {
         if (!window.confirm(`¿Está seguro de marcar el paquete ${idPaquete} como ENTREGADO? Esto solo funciona si está EN_TRANSITO.`)) {
            return;
        }
        
        setNotificacion(`Procesando entrega del paquete ${idPaquete}...`);

        try {
            // Petición PUT para cambiar el estado a ENTREGADO
            await axios.put(`${URL_BASE}/envios/${idPaquete}/estado`, `"ENTREGADO"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            setNotificacion(`Paquete ${idPaquete} marcado como ENTREGADO. Mensajero asignado ha sido liberado.`);
            setClaveRecarga(k => k + 1); // Forzar la actualización de la lista

        } catch (error) {
            const mensajeServidor = error.response?.data || 'Error de conexión.';
            setNotificacion(`Fallo al marcar como entregado: ${mensajeServidor}`);
        }
    };


    if (estaCargando) return <p>Cargando el listado de paquetes disponibles...</p>;
    if (mensajeError) return <p className="mensaje-error-critico">{mensajeError}</p>;

    return (
        <div className="contenedor-listado">
            <h2>Gestión de Paquetes en el Sistema ({listaPaquetes.length})</h2>
            <Link to="/paquetes/crear" className="boton-crear">
                + Registrar Nuevo Paquete
            </Link>
            
            <Link to="/envios/utilidades" className="boton-utilidades">
                Ver Utilidades de Envío (Asignación/Entrega)
            </Link>

            {/* Muestra mensajes de éxito o error tras una operación */}
            {notificacion && (
                <p className={notificacion.startsWith('Error') ? 'mensaje-error' : 'mensaje-exito'}>
                    {notificacion}
                </p>
            )}

            {listaPaquetes.length === 0 ? (
                <p>No hay paquetes registrados en la base de datos.</p>
            ) : (
                <table className="tabla-datos">
                    <thead>
                        <tr>
                            <th>ID Paquete</th>
                            <th>Cliente</th>
                            <th>Peso (Kg)</th>
                            <th>Origen (Centro Actual)</th>
                            <th>Destino Final</th>
                            <th>Estado Actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listaPaquetes.map((paquete) => (
                            <tr key={paquete.id}>
                                <td>{paquete.id}</td>
                                <td>{paquete.cliente}</td>
                                <td>{paquete.peso.toFixed(1)}</td>
                                <td>
                                    <Link to={`/centros/${paquete.centroActual}`}>{paquete.centroActual}</Link>
                                </td>
                                <td>{paquete.destino}</td>
                                <td>
                                    <span className={`estado-paquete estado-${paquete.estado.toLowerCase().replace('_', '-')}`}>
                                        {paquete.estado}
                                    </span>
                                </td>
                                <td>
                                    <Link 
                                        to={`/paquetes/editar/${paquete.id}`} 
                                        className="boton-accion boton-editar"
                                    >
                                        Editar
                                    </Link>
                                    
                                    {/* Solo se puede eliminar si está PENDIENTE o ENTREGADO. Si está en tránsito, solo se puede marcar como entregado. */}
                                    {paquete.estado === 'PENDIENTE' || paquete.estado === 'ENTREGADO' ? (
                                        <button 
                                            onClick={() => manejarEliminacion(paquete.id)} 
                                            className="boton-accion boton-eliminar"
                                        >
                                            Eliminar
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => manejarEntrega(paquete.id)} 
                                            className="boton-accion boton-entregar"
                                            disabled={paquete.estado === 'ENTREGADO'} // Deshabilitado si ya está Entregado
                                        >
                                            Marcar Entregado
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PaquetesList;