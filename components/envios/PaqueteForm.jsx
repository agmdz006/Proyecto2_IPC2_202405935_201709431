
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

// Constante base para la API del backend
const BASE_DE_API = 'http://localhost:8080/api';

function PaqueteFormulario() {
    const navegacion = useNavigate();
    const parametros = useParams(); 
    const idPaquete = parametros.id; 
    const esModoEdicion = !!idPaquete;

    // Estado inicial de los campos del formulario
    const [datosFormulario, setDatosFormulario] = useState({
        id: '',
        cliente: '',
        peso: 0.1, 
        destino: '',
        centroActual: '',
        estado: 'PENDIENTE', 
    });
    
    // Estados para controlar la interfaz de usuario
    const [estaCargando, setEstaCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);

    // ----------------------------------------------------
    // Lógica para cargar datos si estamos editando
    // ----------------------------------------------------
    useEffect(() => {
        // Ejecutamos solo si estamos en modo edición
        if (esModoEdicion) {
            const obtenerDatosPaquete = async () => {
                setEstaCargando(true);
                try {
                    // Realizar la petición GET al endpoint específico del paquete
                    const respuesta = await axios.get(`${BASE_DE_API}/paquetes/${idPaquete}`);
                    setDatosFormulario(respuesta.data); // Asignar los datos recibidos al estado
                } catch (errorPeticion) {
                    console.error("Error al obtener el paquete:", errorPeticion);
                    setMensajeError('No fue posible cargar la información del paquete para su edición.');
                } finally {
                    setEstaCargando(false);
                }
            };
            obtenerDatosPaquete();
        }
    }, [idPaquete, esModoEdicion]); // Dependencias para asegurar que se ejecute al cambiar el ID

    // ----------------------------------------------------
    // Manejador de cambios en los inputs
    // ----------------------------------------------------
    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        let valorProcesado = value;

        // Limpieza y estandarización de los campos críticos
        if (name === 'destino' || name === 'centroActual' || name === 'id') {
            valorProcesado = value.toUpperCase().trim();
        } else if (name === 'peso') {
            valorProcesado = parseFloat(value) || 0.1; // Asegura que sea un número flotante
        }
        
        // Actualización del estado del formulario
        setDatosFormulario(datosAnteriores => ({
            ...datosAnteriores,
            [name]: valorProcesado
        }));
    };

    // ----------------------------------------------------
    // Manejador del envío del formulario (Crear o Actualizar)
    // ----------------------------------------------------
    const manejarEnvio = async (evento) => {
        evento.preventDefault();
        setEstaCargando(true);
        setMensajeError(null);
        setMensajeExito(null);

        if (datosFormulario.peso <= 0) {
            setMensajeError('El peso del paquete debe ser un valor positivo.');
            setEstaCargando(false);
            return;
        }

        try {
            if (esModoEdicion) {
                // Lógica para ACTUALIZAR (PUT)
                await axios.put(`${BASE_DE_API}/paquetes/${idPaquete}`, datosFormulario);
                setMensajeExito('Paquete actualizado con éxito. Redirigiendo...');
            } else {
                // Lógica para CREAR (POST)
                await axios.post(`${BASE_DE_API}/paquetes`, datosFormulario);
                setMensajeExito('Paquete creado y registrado en el sistema. Redirigiendo...');
            }
            
            // Redirigir al listado después de un breve retraso
            setTimeout(() => navegacion('/paquetes'), 1500); 

        } catch (errorPeticion) {
            // Manejo de errores de respuesta del servidor
            const mensajeDelServidor = errorPeticion.response?.data || 'Error de comunicación con la API.';
            setMensajeError(`Error al intentar guardar el paquete: ${mensajeDelServidor}`);
        } finally {
            setEstaCargando(false);
        }
    };

    if (estaCargando && esModoEdicion) return <p>Cargando información del paquete para edición...</p>;

    return (
        <div className="contenedor-formulario">
            <h1 className="titulo-principal">{esModoEdicion ? `Edición de Paquete: ${idPaquete}` : 'Registro de Nuevo Paquete'}</h1>
            <p className="descripcion">El paquete se inicia en estado PENDIENTE. Asegure que los IDs de centro existan en el sistema.</p>
            
            {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
            {mensajeError && <p className="mensaje-error">{mensajeError}</p>}

            <form onSubmit={manejarEnvio} className="formulario-estandar">
                
                <div className="grupo-control">
                    <label htmlFor="id">Identificador Único del Paquete:</label>
                    <input 
                        type="text" 
                        id="id" 
                        name="id" 
                        value={datosFormulario.id} 
                        onChange={manejarCambio} 
                        required 
                        disabled={esModoEdicion} 
                        className="input-texto"
                    />
                    {esModoEdicion && <small className="nota-deshabilitada">El ID no puede ser modificado durante la edición.</small>}
                </div>
                
                <div className="grupo-control">
                    <label htmlFor="cliente">Nombre o Identificador del Cliente:</label>
                    <input 
                        type="text" 
                        id="cliente" 
                        name="cliente" 
                        value={datosFormulario.cliente} 
                        onChange={manejarCambio} 
                        required 
                        className="input-texto" 
                    />
                </div>

                <div className="grupo-control">
                    <label htmlFor="peso">Peso del Paquete (en kg, mayor a 0):</label>
                    <input 
                        type="number" 
                        id="peso" 
                        name="peso" 
                        value={datosFormulario.peso} 
                        onChange={manejarCambio} 
                        step="0.1" 
                        min="0.1" 
                        required 
                        className="input-numero" 
                    />
                </div>

                <div className="grupo-control">
                    <label htmlFor="destino">ID del Centro Destino:</label>
                    <input 
                        type="text" 
                        id="destino" 
                        name="destino" 
                        value={datosFormulario.destino} 
                        onChange={manejarCambio} 
                        required 
                        className="input-texto" 
                    />
                </div>
                
                <div className="grupo-control">
                    <label htmlFor="centroActual">ID del Centro de Origen/Actual:</label>
                    <input 
                        type="text" 
                        id="centroActual" 
                        name="centroActual" 
                        value={datosFormulario.centroActual} 
                        onChange={manejarCambio} 
                        required 
                        disabled={esModoEdicion && datosFormulario.estado !== 'PENDIENTE'} 
                        className="input-texto"
                    />
                    {esModoEdicion && datosFormulario.estado !== 'PENDIENTE' && 
                        <small className="nota-deshabilitada">El centro de origen solo se puede modificar si el estado es PENDIENTE.</small>
                    }
                </div>
                
                <div className="grupo-control">
                    <label>Estado Actual del Paquete:</label>
                    <input type="text" value={datosFormulario.estado} disabled className="input-deshabilitado" />
                </div>
                
                <button type="submit" disabled={estaCargando} className="boton-primario">
                    {estaCargando ? 'Procesando Solicitud...' : (esModoEdicion ? 'Actualizar Información' : 'Registrar Paquete')}
                </button>
            </form>
            <Link to="/paquetes" className="enlace-volver">Regresar al Listado de Paquetes</Link>
        </div>
    );
}

export default PaqueteFormulario;