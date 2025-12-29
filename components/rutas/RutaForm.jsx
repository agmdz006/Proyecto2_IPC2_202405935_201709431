
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';

const API_SERVICIO_RUTAS = 'http://localhost:8080/api/rutas';

function RutaForm() { 
    const navigate = useNavigate();
  
    const { id } = useParams(); 
    
    // El ID simple es lo que usamos para la URL
    const idSimple = id; 
    
    const esEdicionActiva = !!idSimple;

    const [datosRuta, setDatosRuta] = useState({
        id: '',        
        origen: '',
        destino: '',
        distancia: 1,  // Mínimo 1 para evitar problemas con la validación de distancia > 0
    });
    
    // Estados para la experiencia del usuario y feedback
    const [estadoCarga, setEstadoCarga] = useState(false);
    const [avisoError, setAvisoError] = useState(null);
    const [avisoExito, setAvisoExito] = useState(null);

    // ----------------------------------------------------
    // Lógica para cargar datos si se está editando (GET /api/rutas/{id})
    // ----------------------------------------------------
    const cargarRutaParaEdicion = useCallback(async () => {
        if (!esEdicionActiva) return;

        setEstadoCarga(true);
        try {
            // USAMOS EL ENDPOINT DE GET /api/rutas/{id}
            const respuesta = await axios.get(`${API_SERVICIO_RUTAS}/${idSimple}`);
            // El backend solo retorna id, origen, destino, distancia
            setDatosRuta(respuesta.data); 
        } catch (error) {
            console.error("Error al buscar la ruta:", error.response?.data || error.message);
            setAvisoError(`No se pudo encontrar o cargar la ruta con ID ${idSimple}. Verifique el ID.`);
        } finally {
            setEstadoCarga(false);
        }
    }, [idSimple, esEdicionActiva]);
    
    useEffect(() => {
        cargarRutaParaEdicion();
    }, [cargarRutaParaEdicion]);

    // ----------------------------------------------------
    // Manejador de Inputs
    // ----------------------------------------------------
    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        let valorProcesado = value;

        // Estandarización de IDs
        if (name === 'id' || name === 'origen' || name === 'destino') {
            valorProcesado = value.toUpperCase().trim();
        } else if (name === 'distancia') {
            valorProcesado = parseInt(value) || 1; 
        }
        
        setDatosRuta(prev => ({
            ...prev,
            [name]: valorProcesado
        }));
    };

    // ----------------------------------------------------
    // Manejador del Envío (POST para crear, PUT para editar)
    // ----------------------------------------------------
    const manejarEnvio = async (evento) => {
        evento.preventDefault();
        setEstadoCarga(true);
        setAvisoError(null);
        setAvisoExito(null);

        if (!datosRuta.id || datosRuta.distancia < 1) {
            setAvisoError('Debe proporcionar un ID y la distancia debe ser mayor a 0.');
            setEstadoCarga(false);
            return;
        }

        const metodo = esEdicionActiva ? 'put' : 'post';
        // URL correcta para POST y PUT
        const url = esEdicionActiva ? `${API_SERVICIO_RUTAS}/${datosRuta.id}` : API_SERVICIO_RUTAS; 
        
        try {
            // Los datos que enviamos son los mismos para crear o editar
            await axios[metodo](url, datosRuta);
            
            const accionRealizada = esEdicionActiva ? 'actualizada' : 'creada';
            setAvisoExito(` Ruta ${datosRuta.id} ${accionRealizada} correctamente. Redirigiendo...`);
            
            setTimeout(() => navigate('/rutas'), 1500); 

        } catch (errorPeticion) {
            // Aquí capturamos los errores 400 (ID/Ruta duplicada) o 404 (No encontrado)
            const mensajeDelServidor = errorPeticion.response?.data || 'Error de conexión con el servicio.';
            setAvisoError(` Fallo al guardar la ruta: ${mensajeDelServidor}`);
        } finally {
            setEstadoCarga(false);
        }
    };


    return (
        <div className="contenedor-formulario">
            <h1 className="titulo-principal">{esEdicionActiva ? `Edición de Ruta: ${idSimple}` : 'Definición de Nueva Ruta'}</h1>
            
            {avisoExito && <p className="mensaje-exito">{avisoExito}</p>}
            {avisoError && <p className="mensaje-error">{avisoError}</p>}
            {estadoCarga && esEdicionActiva && <p className="mensaje-carga">Cargando datos de edición...</p>}

            <form onSubmit={manejarEnvio} className="formulario-estandar">
                
                {/* ID de la Ruta */}
                <div className="grupo-control">
                    <label htmlFor="id">ID de la Ruta (Ej: R001)</label>
                    <input 
                        type="text" 
                        id="id" 
                        name="id" 
                        value={datosRuta.id} 
                        onChange={manejarCambio} 
                        required 
                        disabled={esEdicionActiva} // Deshabilitado en edición
                        className="input-texto"
                    />
                </div>
                
                {/* Origen y Destino - Deshabilitados en Edición */}
                <div className="grupo-control">
                    <label htmlFor="origen">ID del Centro de Origen (A):</label>
                    <input 
                        type="text" 
                        id="origen" 
                        name="origen" 
                        value={datosRuta.origen} 
                        onChange={manejarCambio} 
                        required 
                        disabled={esEdicionActiva} 
                        className="input-texto"
                    />
                </div>
                
                <div className="grupo-control">
                    <label htmlFor="destino">ID del Centro de Destino (B):</label>
                    <input 
                        type="text" 
                        id="destino" 
                        name="destino" 
                        value={datosRuta.destino} 
                        onChange={manejarCambio} 
                        required 
                        disabled={esEdicionActiva} 
                        className="input-texto"
                    />
                </div>

                {/* Distancia - Único campo editable según el Service */}
                <div className="grupo-control">
                    <label htmlFor="distancia">Distancia de la Ruta (Km, &gt; 0):</label>
                    <input 
                        type="number" 
                        id="distancia" 
                        name="distancia" 
                        value={datosRuta.distancia} 
                        onChange={manejarCambio} 
                        step="1" 
                        min="1" 
                        required 
                        className="input-numero" 
                    />
                </div>
                
                
                
                <button type="submit" disabled={estadoCarga} className="boton-primario">
                    {estadoCarga ? 'Guardando...' : (esEdicionActiva ? 'Guardar Cambios de Distancia' : 'Crear Nueva Ruta')}
                </button>
            </form>
            <Link to="/rutas" className="enlace-volver">Regresar a la Gestión de Rutas</Link>
        </div>
    );
}

export default RutaForm;