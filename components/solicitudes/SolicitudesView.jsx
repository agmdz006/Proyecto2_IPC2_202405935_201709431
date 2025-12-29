import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ENDPOINT_SOLICITUDES = 'http://localhost:8080/api/solicitudes';

function SolicitudesView() {
    const [listadoSolicitudes, setListadoSolicitudes] = useState([]);
    
    // Estados para gestión de la interfaz
    const [estadoCarga, setEstadoCarga] = useState(true);
    const [mensajeDeError, setMensajeDeError] = useState(null);
    const [feedbackOperacion, setFeedbackOperacion] = useState(null);
    
    const [nProcesar, setNProcesar] = useState(1);
    
    //forzar la recarga
    const [contadorActualizador, setContadorActualizador] = useState(0);

    
    const obtenerSolicitudesPendientes = useCallback(async () => {
        setEstadoCarga(true);
        setMensajeDeError(null);
        try {
            const respuesta = await axios.get(ENDPOINT_SOLICITUDES);
            
            // Ordenar las solicitudes por PRIORIDAD (mayor número primero) 
            const solicitudesOrdenadas = respuesta.data.sort((a, b) => b.prioridad - a.prioridad);
            setListadoSolicitudes(solicitudesOrdenadas);
            
        } catch (errorPeticion) {
            console.error('Error al obtener solicitudes:', errorPeticion);
            setMensajeDeError('Fallo al cargar la lista de solicitudes. Verifique el backend.');
        } finally {
            setEstadoCarga(false);
        }
    }, []);

    // Hook para ejecutar la búsqueda inicial
    useEffect(() => {
        obtenerSolicitudesPendientes();
    }, [obtenerSolicitudesPendientes, contadorActualizador]);

    const manejarDespacho = async () => {
        if (listadoSolicitudes.length === 0) {
            setFeedbackOperacion({ texto: 'No hay solicitudes pendientes en la cola.', tipo: 'aviso' });
            return;
        }
        
        if (!window.confirm(`¿Ejecutar el procesamiento de las ${nProcesar} solicitudes de mayor prioridad?`)) {
            return;
        }

        setEstadoCarga(true);
        setFeedbackOperacion({ texto: `Ejecutando procesamiento para ${nProcesar} solicitudes...`, tipo: 'proceso' });

        try {
            // Llamamos al endpoint de procesamiento masivo: POST /api/solicitudes/procesar/{n}
            const url = `${ENDPOINT_SOLICITUDES}/procesar/${nProcesar}`;
            const respuesta = await axios.post(url);

            // La respuesta es una lista de mensajes (gracias a SolicitudService)
            const resultados = respuesta.data;
            const exitos = resultados.filter(msg => msg.includes('ÉXITO')).length;

            if (exitos > 0) {
                setFeedbackOperacion({ 
                    texto: `Despacho completado con éxito. Se procesaron ${exitos} solicitudes. Ver detalles en consola.`, 
                    tipo: 'exito' 
                });
            } else {
                setFeedbackOperacion({ 
                    texto: `Procesamiento completado, pero no se pudo despachar ninguna solicitud. Motivo: Mensajero/Ruta no disponible.`, 
                    tipo: 'error' 
                });
            }
            
            // Forzar recarga de la lista
            setContadorActualizador(c => c + 1); 

        } catch (errorPeticion) {
            const errorServidor = errorPeticion.response?.data || 'Error de conexión con el servicio de despacho.';
            setFeedbackOperacion({ texto: `Fallo grave al ejecutar el despacho: ${errorServidor}`, tipo: 'error' });
        } finally {
            setEstadoCarga(false);
        }
    };


    const manejarCancelacion = async (idSolicitud) => {
        if (!window.confirm(`¿Está seguro de CANCELAR la solicitud de despacho ${idSolicitud}?`)) {
            return;
        }

        setFeedbackOperacion({ texto: `Procesando cancelación de solicitud ${idSolicitud}...`, tipo: 'proceso' });

        try {
            // Usamos DELETE /api/solicitudes/{id}
            await axios.delete(`${ENDPOINT_SOLICITUDES}/${idSolicitud}`);
            
            setFeedbackOperacion({ texto: `Solicitud ${idSolicitud} CANCELADA con éxito.`, tipo: 'exito' });
            setContadorActualizador(c => c + 1); // Forzar la recarga
            
        } catch (errorPeticion) {
            const errorServidor = errorPeticion.response?.data || 'Error de conexión.';
            setFeedbackOperacion({ texto: `Fallo al cancelar la solicitud: ${errorServidor}`, tipo: 'error' });
        }
    };

    const obtenerClaseAlerta = (tipo) => {
        switch(tipo) {
            case 'exito': return 'alerta-success';
            case 'error': return 'alerta-error';
            case 'aviso': return 'alerta-warning';
            case 'proceso': return 'alerta-info';
            default: return 'alerta-info';
        }
    };

    return (
        <div className="listado-view-container"> 
            
            {/* Cabecera de la Vista */}
            <div className="view-header">
                <h1 className="view-titulo">Gestión de Solicitudes de Despacho ({listadoSolicitudes.length})</h1>
                <p className="view-descripcion">Listado de paquetes que esperan ser asignados a un mensajero para su envío.</p>
            </div>
            
            {/* Botones de Acción: Crear Solicitud y Despacho */}
            <div className="view-acciones-grupo">
                <Link to="/solicitudes/crear" className="btn btn-primary">
                    + Crear Nueva Solicitud
                </Link>

                <div className="control-despacho-inline">
                    <input 
                        type="number" 
                        value={nProcesar} 
                        onChange={(e) => setNProcesar(parseInt(e.target.value) || 1)} 
                        min="1"
                        max={listadoSolicitudes.length > 0 ? listadoSolicitudes.length : 1}
                        style={{ width: '60px', marginRight: '10px' }}
                        disabled={estadoCarga || listadoSolicitudes.length === 0}
                    />
                    <button 
                        onClick={manejarDespacho} 
                        disabled={estadoCarga || listadoSolicitudes.length === 0}
                        className="btn btn-success"
                    >
                        {estadoCarga ? 'Procesando...' : `Ejecutar Despacho (${listadoSolicitudes.length} en cola)`}
                    </button>
                </div>
            </div>
            
            
            {feedbackOperacion && (
                <div className={`alerta-feedback ${obtenerClaseAlerta(feedbackOperacion.tipo)}`}>
                    {feedbackOperacion.texto}
                </div>
            )}
            {mensajeDeError && (
                <div className="alerta-feedback alerta-error">{mensajeDeError}</div>
            )}

            {/* Renderizado Condicional */}
            <div className="card-listado"> 

                {estadoCarga && !feedbackOperacion ? (
                    <div className="loading-state">Obteniendo listado de solicitudes de despacho...</div>
                ) : listadoSolicitudes.length === 0 ? (
                    <div className="empty-state">No existen solicitudes de despacho pendientes en el sistema.</div>
                ) : (
                    <div className="tabla-responsive">
                        <table className="tabla-logistica">
                            <thead>
                                <tr>
                                    <th>Prioridad</th> {/* Campo nuevo para visibilidad */}
                                    <th>ID Solicitud</th>
                                    <th>ID Paquete</th>
                                    <th>Origen</th>
                                    <th>Destino</th>
                                    <th>Tipo</th>
                                    <th className="th-acciones">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listadoSolicitudes.map((solicitud) => (
                                    // Marcar la fila si es la de mayor prioridad
                                    <tr 
                                        key={solicitud.id} 
                                        className={solicitud.prioridad === listadoSolicitudes[0].prioridad ? 'fila-prioritaria' : ''}
                                    >
                                        <td><strong style={{ color: solicitud.prioridad > 7 ? 'red' : 'darkorange' }}>{solicitud.prioridad}</strong></td>
                                        <td>{solicitud.id}</td>
                                        <td>
                                            {/* Aquí solo mostramos el ID del paquete, pues el backend no retorna el objeto Paquete completo en Solicitud */}
                                            <Link to={`/paquetes/editar/${solicitud.paquete}`}>
                                                {solicitud.paquete || 'N/A'} 
                                            </Link>
                                        </td>
                                        
                                        <td>{'---'}</td> 
                                        <td>{'---'}</td>
                                        <td>
                                             <span className={`estado-badge estado-${(solicitud.tipo || '').toLowerCase()}`}>
                                                 {solicitud.tipo || 'DESCONOCIDO'} 
                                             </span>
                                        </td>
                                        <td>
                                            {/* Las solicitudes siempre están "PENDIENTES" hasta que se procesan y se eliminan de la cola */}
                                            {solicitud.tipo === 'ENVIO' && (
                                                <button 
                                                    onClick={() => manejarCancelacion(solicitud.id)} 
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
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

export default SolicitudesView;