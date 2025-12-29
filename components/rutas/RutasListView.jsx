import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ENDPOINT_RUTAS = 'http://localhost:8080/api/rutas';

function RutasListView() {
    const [listadoRutas, setListadoRutas] = useState([]);
    
    const [estaCargando, setEstaCargando] = useState(true);
    const [avisoFeedback, setAvisoFeedback] = useState(null);
    const [contadorRecarga, setContadorRecarga] = useState(0);

    // ----------------------------------------------------
    // Lógica para obtener el listado de Rutas (GET)
    // ----------------------------------------------------
    const obtenerRutas = useCallback(async () => {
        setEstaCargando(true);
        setAvisoFeedback(null);
        try {
            const respuesta = await axios.get(ENDPOINT_RUTAS);
            setListadoRutas(respuesta.data);
        } catch (error) {
            console.error('Error al obtener rutas:', error);
            setAvisoFeedback({ 
                tipo: 'error', 
                mensaje: 'Fallo al cargar la lista de rutas. Verifique el backend.' 
            });
        } finally {
            setEstaCargando(false);
        }
    }, []);

    useEffect(() => {
        obtenerRutas();
    }, [obtenerRutas, contadorRecarga]);

    const manejarEliminacion = async (idRuta) => {
        if (!window.confirm(`¿Está seguro de ELIMINAR la ruta ${idRuta}? Esto podría afectar envíos pendientes.`)) {
            return;
        }

        setAvisoFeedback({ tipo: 'proceso', mensaje: `Procesando eliminación de ruta ${idRuta}...` });

        try {
            // Llamada DELETE al backend
            await axios.delete(`${ENDPOINT_RUTAS}/${idRuta}`);
            
            setAvisoFeedback({ 
                tipo: 'success', 
                mensaje: `✅ Ruta ${idRuta} eliminada correctamente.` 
            });
            
            setListadoRutas(prevList => prevList.filter(r => r.id !== idRuta));

        } catch (errorPeticion) {
            const errorMsg = errorPeticion.response?.data || 'Error de conexión con el servicio.';
            setAvisoFeedback({ 
                tipo: 'error', 
                mensaje: `❌ Fallo al eliminar la ruta: ${errorMsg}` 
            });
        }
    };
    

    const feedbackClass = avisoFeedback?.tipo === 'error' ? 'alerta-error' : 'alerta-success';

    return (
        <div className="listado-view-container">
            <div className="view-header">
                <h1 className="view-titulo">Gestión de Rutas de Envío ({listadoRutas.length})</h1>
                <p className="view-descripcion">Conexiones definidas entre los diferentes centros de distribución.</p>
            </div>
            
            <div className="view-acciones-grupo">
                <Link to="/rutas/crear" className="btn btn-primary">
                    + Definir Nueva Ruta
                </Link>
            </div>
            
            {avisoFeedback && (
                 <div className={`alerta-feedback ${feedbackClass}`}>
                     {avisoFeedback.mensaje}
                 </div>
            )}

            <div className="card-listado">
                {estaCargando ? (
                    <div className="loading-state">Cargando listado de rutas...</div>
                ) : listadoRutas.length === 0 ? (
                    <div className="empty-state">No hay rutas definidas en el sistema.</div>
                ) : (
                    <div className="tabla-responsive">
                        <table className="tabla-logistica">
                            <thead>
                                <tr>
                                    <th>ID Ruta</th>
                                    <th>Origen (Centro)</th>
                                    <th>Destino (Centro)</th>
                                    <th>Distancia (km)</th>
                                    <th className="th-acciones">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listadoRutas.map((ruta) => (
                                    <tr key={ruta.id}>
                                        <td>{ruta.id}</td>
                                        <td>
                                            <Link to={`/centros/${ruta.origen}`}>{ruta.origen}</Link>
                                        </td>
                                        <td>
                                            <Link to={`/centros/${ruta.destino}`}>{ruta.destino}</Link>
                                        </td>
                                        <td>{ruta.distancia} km</td>
                                        <td>
                                            <Link 
                                                to={`/rutas/editar/${ruta.id}`} 
                                                className="btn btn-sm btn-info"
                                            >
                                                Editar
                                            </Link>
                                            <button 
                                                onClick={() => manejarEliminacion(ruta.id)} 
                                                className="btn btn-sm btn-danger ml-10"
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

export default RutasListView;