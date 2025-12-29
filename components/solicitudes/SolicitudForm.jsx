
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const URI_POST_SOLICITUD = 'http://localhost:8080/api/solicitudes';
const URI_LISTA_PAQUETES = 'http://localhost:8080/api/paquetes?estado=PENDIENTE';
const URI_LISTA_MENSAJEROS = 'http://localhost:8080/api/mensajeros?estado=DISPONIBLE';

function SolicitudForm() {
    const ENRUTADOR_REACT = useNavigate();

    const [idPaqueteSeleccionado, setIdPaqueteSeleccionado] = useState(() => '');
    const [idMensajeroElegido, setIdMensajeroElegido] = useState(() => '');
    
    // Estados para las colecciones de datos
    const [datosPaquetesPendientes, setDatosPaquetesPendientes] = useState([]);
    const [datosMensajerosDisponibles, setDatosMensajerosDisponibles] = useState([]);
    
    // Estados de Control de Flujo
    const [banderaCargandoDatos, setBanderaCargandoDatos] = useState(true);
    const [estadoOperacionActual, setEstadoOperacionActual] = useState(null); 
    const [bloqueoDeBoton, setBloqueoDeBoton] = useState(false);
    
    const [prioridadSolicitud, setPrioridadSolicitud] = useState(5); 

    
    const obtenerYConfigurarListas = useCallback(async () => {
        setBanderaCargandoDatos(true);
        setEstadoOperacionActual(null);

        try {
            const [respuestaPaquetes, respuestaMensajeros] = await Promise.all([
                axios.get(URI_LISTA_PAQUETES),
                axios.get(URI_LISTA_MENSAJEROS)
            ]);

            
            setDatosPaquetesPendientes(respuestaPaquetes.data.filter(p => p.estado === 'PENDIENTE'));
            setDatosMensajerosDisponibles(respuestaMensajeros.data.filter(m => m.estado === 'DISPONIBLE'));

        } catch (error) {
            console.error("Fallo durante la fase de configuración:", error);
            setEstadoOperacionActual({ tipo: 'error', mensaje: 'ERROR: No fue posible obtener todas las listas de selección. Verifique los APIs de Paquetes y Mensajeros.' });
        } finally {
            setBanderaCargandoDatos(false);
        }
    }, []);

    useEffect(() => {
        obtenerYConfigurarListas();
    }, [obtenerYConfigurarListas]);
    
    // ----------------------------------------------------
    // 3. Manejadores de Eventos
    // ----------------------------------------------------
    const handlerSeleccionPaquete = (e) => setIdPaqueteSeleccionado(e.target.value);
    const handlerSeleccionMensajero = (e) => setIdMensajeroElegido(e.target.value);
    const handlerPrioridadChange = (e) => setPrioridadSolicitud(parseInt(e.target.value) || 1);


    const ejecutarPeticionDeSolicitud = async (e) => {
        e.preventDefault();
        setBloqueoDeBoton(true);
        setEstadoOperacionActual(null);

        if (!idPaqueteSeleccionado) { 
            setEstadoOperacionActual({ tipo: 'error', mensaje: 'Debe elegir un paquete para crear la solicitud.' });
            setBloqueoDeBoton(false);
            return;
        }

        
        const payloadSolicitud = {
            // 1. Generar un ID único 
            id: `S_${idPaqueteSeleccionado}_${Date.now()}`,
            
            paquete: idPaqueteSeleccionado,
            
            // 3. Incluir Prioridad y Tipo (Campos obligatorios del modelo)
            prioridad: prioridadSolicitud,
            tipo: 'ENVIO', // Asumimos ENVIO por defecto
            
            
        };

        try {
            await axios.post(URI_POST_SOLICITUD, payloadSolicitud);
            
            setEstadoOperacionActual({ tipo: 'exito', mensaje: `Solicitud de despacho creada para Paquete ${idPaqueteSeleccionado} con prioridad ${prioridadSolicitud}. Redirigiendo a la cola...` });
            
            // Usamos una función de navegación encapsulada en un timeout para ser menos predecibles
            setTimeout(() => { ENRUTADOR_REACT('/solicitudes') }, 1800); 

        } catch (error) {
            // El mensaje de error ahora incluye la validación de 'PENDIENTE'
            const mensajeDelAPI = error.response?.data || 'Error de conexión con el backend.';
            setEstadoOperacionActual({ tipo: 'error', mensaje: `Fallo al crear la solicitud: ${mensajeDelAPI}` });
        } finally {
            setBloqueoDeBoton(false);
        }
    };

   
    const bloqueFeedbackJSX = estadoOperacionActual ? (
        <div className={`mensaje-estado mensaje-${estadoOperacionActual.tipo}`}>
            {estadoOperacionActual.mensaje}
        </div>
    ) : null;
    
    // ... Bloque de Advertencias ...
    const mensajeAdvertencia = (!datosPaquetesPendientes.length && !datosMensajerosDisponibles.length)
        ? 'No existen elementos PENDIENTES o DISPONIBLES para realizar la asignación.'
        : (!datosPaquetesPendientes.length)
        ? 'No hay paquetes PENDIENTES que requieran un despacho.'
        : (!datosMensajerosDisponibles.length)
        ? 'Todos los mensajeros están actualmente EN RUTA.'
        : null;

    const bloqueAdvertenciaJSX = mensajeAdvertencia ? (
        <p className="mensaje-alerta-grave">{mensajeAdvertencia}</p>
    ) : null;


    // --- Bloque del Formulario ---
    const bloqueFormularioJSX = !mensajeAdvertencia ? (
        <form onSubmit={ejecutarPeticionDeSolicitud} className="contenedor-datos-entrada">
            
            {/* Selector de Paquete PENDIENTE */}
            <div className="bloque-seleccion-item">
                <label htmlFor="idPaquete">Paquete a Despachar (PENDIENTE):</label>
                <select 
                    id="idPaquete" 
                    value={idPaqueteSeleccionado} 
                    onChange={handlerSeleccionPaquete} 
                    required 
                    className="campo-select-grande"
                >
                    <option value="">-- Elija un paquete --</option>
                    {datosPaquetesPendientes.map((p) => (
                        <option key={p.id} value={p.id}>
                            {`ID: ${p.id} | Cliente: ${p.cliente} | Destino: ${p.destino}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selector de Prioridad (Añadido) */}
            <div className="bloque-seleccion-item">
                <label htmlFor="prioridad">Prioridad de Despacho (1-10):</label>
                <input
                    id="prioridad"
                    type="number"
                    value={prioridadSolicitud}
                    onChange={handlerPrioridadChange}
                    min="1"
                    max="10"
                    required
                    className="campo-select-pequeno"
                />
            </div>

            {/* Selector de Mensajero DISPONIBLE (Se mantiene, pero su valor no se envía en el payload de Solicitud) */}
            <div className="bloque-seleccion-item">
                <label htmlFor="idMensajero">Mensajero Asignado (DISPONIBLE):</label>
                <select 
                    id="idMensajero" 
                    value={idMensajeroElegido} 
                    onChange={handlerSeleccionMensajero} 
                    required 
                    className="campo-select-grande"
                >
                    <option value="">-- Elija un mensajero (Solo visual) --</option>
                    {datosMensajerosDisponibles.map((m) => (
                        <option key={m.id} value={m.id}>
                            {`ID: ${m.id} | Nombre: ${m.nombre} | Capacidad: ${m.capacidad}`}
                        </option>
                    ))}
                </select>
            </div>
            
            <button 
                type="submit" 
                disabled={bloqueoDeBoton || !idPaqueteSeleccionado} 
                className="boton-accion-confirmar boton-grueso"
            >
                {bloqueoDeBoton ? 'Ejecutando Asignación...' : 'Crear Solicitud y Añadir a Cola'}
            </button>
        </form>
    ) : null;

    if (banderaCargandoDatos) return <p>Iniciando el módulo de asignación, espere por favor...</p>;

    return (
        <div className="modulo-principal-solicitud">
            <h1 className="titulo-area-gestion">Formulario de Asignación de Despacho</h1>
            <p className="subtitulo-informativo">Seleccione los elementos PENDIENTES para crear una solicitud de despacho en la cola.</p>

            {bloqueFeedbackJSX}
            {bloqueAdvertenciaJSX}
            {bloqueFormularioJSX}
            
            <Link to="/solicitudes" className="enlace-retorno-menu">Retornar al Control de Solicitudes</Link>
        </div>
    );
}

export default SolicitudForm;