import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const API_ENDPOINT_BASE = 'http://localhost:8080/api';

function MensajeroForm() { 
    const navigate = useNavigate();
    const { id } = useParams(); 
    const esModoEdicion = !!id; 

    const [datosMensajero, setDatosMensajero] = useState({
        id: '',
        nombre: '',
        capacidad: 1, 
        centro: '', 
        estado: 'DISPONIBLE', 
    });
    
    const [estaCargando, setEstaCargando] = useState(false);
    const [notificacionError, setNotificacionError] = useState(null);
    const [notificacionExito, setNotificacionExito] = useState(null);
    
    // --- LÓGICA DE CARGA DE DATOS ---
    useEffect(() => {
        if (esModoEdicion) {
            const obtenerMensajeroExistente = async () => {
                setEstaCargando(true);
                try {
                    const respuesta = await axios.get(`${API_ENDPOINT_BASE}/mensajeros/${id}`);
                    setDatosMensajero(respuesta.data);
                } catch (errorConsulta) {
                    console.error("Fallo al obtener datos del mensajero:", errorConsulta);
                    setNotificacionError('No fue posible cargar el mensajero para el proceso de edición.');
                } finally {
                    setEstaCargando(false);
                }
            };
            obtenerMensajeroExistente();
        }
    }, [id, esModoEdicion]); 

    // --- MANEJADOR DE INPUTS ---
    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        let valorAProcesar = value;

        if (name === 'id' || name === 'centro') {
            valorAProcesar = value.toUpperCase().trim();
        } else if (name === 'capacidad') {
            valorAProcesar = parseInt(value) || 1;
        }
        
        setDatosMensajero(prev => ({
            ...prev,
            [name]: valorAProcesar
        }));
    };

    // --- MANEJADOR ESPECÍFICO  REASIGNAR CENTRO ---
    const handleReasignarCentro = async (evento) => {
        evento.preventDefault(); 
        
        if (datosMensajero.estado === 'EN_TRANSITO') {
            setNotificacionError('No se puede reasignar el centro: el mensajero está EN_TRANSITO.');
            return;
        }

        setEstaCargando(true);
        setNotificacionError(null);
        setNotificacionExito(null);

        try {
            const url = `${API_ENDPOINT_BASE}/mensajeros/${id}/centro`;
            
            // Enviamos el body esperado por el backend: { "centroId": "ID_CENTRO" }
            await axios.put(url, { centroId: datosMensajero.centro });
            
            setNotificacionExito(`Centro reasignado a ${datosMensajero.centro} exitosamente.`);
            
        } catch (errorPeticion) {
            const mensajeDelServidor = errorPeticion.response?.data || 'Error de comunicación al reasignar centro.';
            setNotificacionError(`Error al reasignar centro: ${mensajeDelServidor}`);
        } finally {
            setEstaCargando(false);
        }
    };
    
    // --- MANEJADOR ESPECÍFICO CAMBIAR ESTADO ---
    const handleCambiarEstado = async (nuevoEstado) => {
        
        // Evita el cambio si ya tiene el estado deseado
        if (datosMensajero.estado === nuevoEstado) {
             setNotificacionError(`El mensajero ya está en estado ${nuevoEstado}.`);
             return;
        }

        setEstaCargando(true);
        setNotificacionError(null);
        setNotificacionExito(null);

        try {
            const url = `${API_ENDPOINT_BASE}/mensajeros/${id}/estado`;
            
            // Enviamos el body esperado por el backend: { "estado": "NUEVO_ESTADO" }
            await axios.put(url, { estado: nuevoEstado });
            
            // Actualizamos el estado local para reflejar el cambio inmediatamente
            setDatosMensajero(prev => ({ ...prev, estado: nuevoEstado }));
            setNotificacionExito(`Estado cambiado a ${nuevoEstado} exitosamente.`);
            
        } catch (errorPeticion) {
            const mensajeDelServidor = errorPeticion.response?.data || 'Error de comunicación al cambiar estado.';
            setNotificacionError(`Error al cambiar estado: ${mensajeDelServidor}`);
        } finally {
            setEstaCargando(false);
        }
    };


    // --- MANEJADOR GENERAL POST/PUT para Nombre/Capacidad ---
    const manejarEnvio = async (evento) => {
        evento.preventDefault();
        setEstaCargando(true);
        setNotificacionError(null);
        setNotificacionExito(null);

        if (datosMensajero.capacidad < 1) {
            setNotificacionError('La capacidad del mensajero debe ser igual o superior a 1 paquete.');
            setEstaCargando(false);
            return;
        }

        try {
            if (esModoEdicion) {
                // Petición PUT para actualizar SOLO NOMBRE y CAPACIDAD 
                await axios.put(`${API_ENDPOINT_BASE}/mensajeros/${id}`, datosMensajero);
                setNotificacionExito('Nombre y Capacidad actualizados exitosamente.');
                
            } else {
                // Petición POST para crear
                await axios.post(`${API_ENDPOINT_BASE}/mensajeros`, datosMensajero);
                setNotificacionExito('Mensajero registrado y contratado con éxito. Redirigiendo...');
                setTimeout(() => navigate('/mensajeros'), 1500); 
            }
            
        } catch (errorPeticion) {
            const mensajeDelServidor = errorPeticion.response?.data || 'Error de comunicación con la API.';
            setNotificacionError(`Error al guardar datos básicos: ${mensajeDelServidor}`);
        } finally {
            setEstaCargando(false);
        }
    };

    if (estaCargando && esModoEdicion) return <p>Cargando datos del mensajero...</p>;

    return (
        <div className="contenedor-formulario">
            <h1 className="titulo-principal">{esModoEdicion ? `Edición de Mensajero: ${id}` : 'Contratación de Nuevo Mensajero'}</h1>
            <p className="descripcion">El mensajero se configura en estado DISPONIBLE. El centro asignado debe ser un ID de centro existente.</p>
            
            {notificacionExito && <p className="mensaje-exito">{notificacionExito}</p>}
            {notificacionError && <p className="mensaje-error">{notificacionError}</p>}

            {/* --- EDICIÓN DE DATOS BÁSICOS (Nombre y Capacidad) --- */}
            <form onSubmit={manejarEnvio} className="formulario-estandar">
                
                <div className="grupo-control">
                    <label htmlFor="id">ID del Mensajero:</label>
                    <input type="text" id="id" name="id" value={datosMensajero.id} onChange={manejarCambio} required disabled={esModoEdicion} className="input-texto" />
                    {esModoEdicion && <small className="nota-deshabilitada">El ID no puede ser modificado.</small>}
                </div>
                
                <div className="grupo-control">
                    <label htmlFor="nombre">Nombre Completo del Empleado:</label>
                    <input type="text" id="nombre" name="nombre" value={datosMensajero.nombre} onChange={manejarCambio} required className="input-texto" />
                </div>

                <div className="grupo-control">
                    <label htmlFor="capacidad">Capacidad de Carga (Paquetes, Mínimo 1):</label>
                    <input type="number" id="capacidad" name="capacidad" value={datosMensajero.capacidad} onChange={manejarCambio} min="1" required className="input-numero" />
                </div>
                
                {/* Botón de envío que solo maneja el POST (Creación) o PUT general (Nombre/Capacidad) */}
                <button type="submit" disabled={estaCargando} className="boton-primario">
                    {estaCargando ? 'Procesando...' : (esModoEdicion ? 'Guardar Nombre/Capacidad' : 'Contratar Nuevo Mensajero')}
                </button>
            </form>
            
            {/* --- GESTIÓN DE CENTRO Y ESTADO (Solo en modo Edición) --- */}
            {esModoEdicion && (
                <div className="seccion-gestion-especifica">
                    <h2>Gestión Logística</h2>
                    
                    {/* CONTROL DE CENTRO */}
                    <div className="grupo-control">
                        <label htmlFor="centro">ID del Centro Base Asignado:</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                id="centro" 
                                name="centro" 
                                value={datosMensajero.centro} 
                                onChange={manejarCambio} 
                                required 
                                className="input-texto"
                                style={{ flexGrow: 1 }}
                            />
                            {/* Botón que llama a handleReasignarCentro */}
                            <button 
                                type="button" 
                                onClick={handleReasignarCentro} 
                                disabled={estaCargando || datosMensajero.estado === 'EN_TRANSITO'}
                                className="boton-secundario"
                                style={{ minWidth: '150px' }}
                            >
                                {estaCargando ? 'Reasignando...' : 'Cambiar Centro'}
                            </button>
                        </div>
                        {datosMensajero.estado === 'EN_TRANSITO' && 
                            <small className="nota-deshabilitada-rojo">El centro no puede cambiarse mientras el mensajero esté EN_TRANSITO.</small>
                        }
                    </div>
                    
                    {/* CONTROL DE ESTADO */}
                    <div className="grupo-control">
                        <label>Estado Operativo: **{datosMensajero.estado}**</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {datosMensajero.estado !== 'DISPONIBLE' ? (
                                <button 
                                    type="button"
                                    onClick={() => handleCambiarEstado('DISPONIBLE')}
                                    disabled={estaCargando}
                                    className="boton-exito"
                                >
                                    {estaCargando ? 'Cambiando...' : 'Marcar DISPONIBLE'}
                                </button>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => handleCambiarEstado('EN_TRANSITO')}
                                    disabled={estaCargando}
                                    className="boton-peligro"
                                >
                                    {estaCargando ? 'Cambiando...' : 'Marcar EN_TRANSITO'}
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            )}

            <Link to="/mensajeros" className="enlace-volver">Regresar al Listado de Mensajeros</Link>
        </div>
    );
}

export default MensajeroForm;