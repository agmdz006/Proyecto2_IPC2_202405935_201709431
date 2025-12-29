// src/components/rutas/RutasList.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ENDPOINT_BASE = 'http://localhost:8080/api/rutas';

function RutasList() { 
    const [listadoRutas, setListadoRutas] = useState([]);
    
    // Estados para control de la interfaz
    const [esCargaInicial, setEsCargaInicial] = useState(true);
    const [alertaError, setAlertaError] = useState(null);
    const [mensajeFeedback, setMensajeFeedback] = useState(null);
    
    // disparador para la re-ejecución del fetch
    const [disparadorRefetch, setDisparadorRefetch] = useState(0);

    // ----------------------------------------------------
    // Lógica para obtener el listado de Rutas (GET)
    // ----------------------------------------------------
    const ejecutarBusquedaDeRutas = useCallback(async () => {
        setEsCargaInicial(true);
        setAlertaError(null);
        try {
            const respuestaAPI = await axios.get(ENDPOINT_BASE);
            setListadoRutas(respuestaAPI.data);
        } catch (errorPeticion) {
            console.error('Error al obtener la lista de rutas:', errorPeticion);
            setAlertaError('Fallo al cargar la lista de rutas. Verifique la conectividad del servidor.');
        } finally {
            setEsCargaInicial(false);
        }
    }, []);

    // Hook de efecto para cargar datos
    useEffect(() => {
        ejecutarBusquedaDeRutas();
    }, [ejecutarBusquedaDeRutas, disparadorRefetch]);

    // ----------------------------------------------------
    // Manejador para la eliminación (DELETE /api/rutas/{origen}/{destino})
    // ----------------------------------------------------
    const procesarEliminacion = async (origen, destino) => {
        const idRuta = `${origen}-${destino}`;
        if (!window.confirm(`¿Está seguro de eliminar esta ruta unidireccional: ${origen} -> ${destino}?`)) {
            return;
        }
        
        setMensajeFeedback(`Iniciando eliminación de la ruta ${idRuta}...`);

        try {
            // Petición DELETE
            await axios.delete(`${ENDPOINT_BASE}/${origen}/${destino}`);
            setMensajeFeedback(`Ruta ${idRuta} eliminada exitosamente.`);
            setDisparadorRefetch(d => d + 1); // Forzar re-fetch
            
        } catch (errorPeticion) {
            const mensajeDelServidor = errorPeticion.response?.data || 'Error de conexión.';
            setMensajeFeedback(`Fallo al eliminar: ${mensajeDelServidor}`);
        }
    };
    
    // ----------------------------------------------------
    // Función de Renderizado de Filas (Aislamiento de la lógica de iteración)
    // ----------------------------------------------------
    const obtenerFilasDeTabla = useMemo(() => {
        const filasDeRutas = [];
        
        for (const ruta of listadoRutas) {
            const identificadorUnico = `${ruta.origen}-${ruta.destino}`;
            const costoTotal = (ruta.distancia * ruta.costoKm).toFixed(2);
            
            filasDeRutas.push(
                <tr key={identificadorUnico}>
                    <td>{ruta.origen}</td>
                    <td>{ruta.destino}</td>
                    <td>{ruta.distancia.toFixed(2)} Km</td>
                    <td>Q {ruta.costoKm.toFixed(2)}</td>
                    <td>Q {costoTotal}</td>
                    <td>
                        <Link 
                            to={`/rutas/editar/${identificadorUnico}`} 
                            
                            state={{ ruta: ruta }} 
                            className="boton-accion boton-editar"
                        >
                            Modificar Parámetros
                        </Link>
                        <button 
                            onClick={() => procesarEliminacion(ruta.origen, ruta.destino)} 
                            className="boton-accion boton-eliminar"
                        >
                            Dar de Baja
                        </button>
                    </td>
                </tr>
            );
        }
        return filasDeRutas;
    }, [listadoRutas]); 

    // ----------------------------------------------------
    // Renderizado Principal
    // ----------------------------------------------------

    return (
        <div className="contenedor-listado">
            <h2 className="titulo-seccion">Catálogo de Rutas Logísticas ({listadoRutas.length})</h2>
            
            <Link to="/rutas/crear" className="boton-crear">
                + Definir Nueva Ruta
            </Link>

            {/* Renderizado de Feedback de Operación */}
            {mensajeFeedback && (
                <p className={mensajeFeedback.startsWith('Fallo') ? 'mensaje-error' : 'mensaje-exito'}>
                    {mensajeFeedback}
                </p>
            )}

            {/* Manejo de Estados de Carga y Error */}
            {esCargaInicial
                ? <p className="mensaje-carga">Buscando datos de rutas en el servidor...</p>
                : (alertaError 
                    ? <p className="mensaje-error-critico">{alertaError}</p>
                    : null
                )
            }
            
            {/* Renderizado de la Tabla o Mensaje de Vacío */}
            {(!esCargaInicial && !alertaError) ? (
                listadoRutas.length === 0
                ? <p>No existen rutas definidas en el sistema. Debe crear las rutas A-&gt;B y B-&gt;A para tránsito bidireccional.</p>
                : (
                    <table className="tabla-datos">
                        <thead>
                            <tr>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th>Distancia</th>
                                <th>Costo por Km</th>
                                <th>Costo Total de Ruta</th>
                                <th>Opciones de Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {obtenerFilasDeTabla}
                        </tbody>
                    </table>
                )
            ) : null}
        </div>
    );
}

export default RutasList;