import React, { useState } from 'react';
import axios from 'axios';

// URL base de tu backend (Asegúrate que coincida con donde corre Spring Boot)
const API_BASE_URL = 'http://localhost:8080/api';

const AsignacionManual = () => {
    // --- Estados para la Asignación Manual (Caja Azul) ---
    const [idPaquete, setIdPaquete] = useState('');
    const [idMensajero, setIdMensajero] = useState('');
    const [mensajeAsignacion, setMensajeAsignacion] = useState('Esperando datos de asignación...');

    // --- Estados para la Finalización de Entrega (Caja Verde) ---
    const [idPaqueteEntrega, setIdPaqueteEntrega] = useState('');
    const [mensajeEntrega, setMensajeEntrega] = useState('Esperando ID de paquete...');

    /**
     * Maneja la asignación manual de un paquete a un mensajero.
     * Llama a: PUT /api/envios/asignar
     */
    const handleAsignacionManual = async () => {
        setMensajeAsignacion('Procesando asignación...');
        
        // El payload debe coincidir con AsignacionManualDTO en Java
        const payload = {
            idPaquete: idPaquete,
            idMensajero: idMensajero
        };

        try {
            // Utilizamos el endpoint corregido de AsignacionController
            const response = await axios.put(`${API_BASE_URL}/envios/asignar`, payload); 
            
            // Éxito: El backend devuelve el objeto Paquete
            setMensajeAsignacion(`✅ ASIGNACIÓN EXITOSA: Paquete ${response.data.id} asignado a ${response.data.mensajeroAsignado} y en estado ${response.data.estado}.`);

        } catch (error) {
            console.error("Error en la asignación manual:", error);
            
            // CRÍTICO: Recibe y muestra el mensaje de error real devuelto por el backend
            const errorMsg = error.response && error.response.data 
                             ? error.response.data 
                             : 'Error de conexión con el backend (Servidor caído o CORS).';
                             
            setMensajeAsignacion(`❌ ERROR: ${errorMsg}`);
        }
    };
    
    /**
     * Maneja la finalización de la entrega (Marcar como Entregado).
     * Llama a: PUT /api/entregas/finalizar
     */
    const handleFinalizarEntrega = async () => {
        setMensajeEntrega('Procesando finalización de entrega...');

        // Payload que espera EntregaController (ej: { idPaquete: "P001" })
        const payload = {
            idPaquete: idPaqueteEntrega
        };

        try {
            // Utilizamos el nuevo endpoint de EntregaController
            const response = await axios.put(`${API_BASE_URL}/entregas/finalizar`, payload);
            
            // Éxito: El paquete está ENTREGADO y el mensajero ha sido liberado
            setMensajeEntrega(`✅ ENTREGA FINALIZADA: Paquete ${response.data.id} marcado como ${response.data.estado}. Mensajero liberado.`);

        } catch (error) {
            console.error("Error al finalizar la entrega:", error);
            
            // CRÍTICO: Recibe y muestra el mensaje de error real devuelto por el backend
            const errorMsg = error.response && error.response.data 
                             ? error.response.data 
                             : 'Error de conexión o estado.';
                             
            setMensajeEntrega(`❌ ERROR: ${errorMsg}`);
        }
    };


    return (
        <div className="container mt-4">
            <h2 className="mb-4">Herramientas de Control Logístico</h2>
            <div className="row">
                {/* -------------------- CAJA 1: ASIGNACIÓN MANUAL -------------------- */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm p-4">
                        <h3 className="card-title">Asignación Manual de Envío</h3>
                        <p className="text-muted">Asigna un paquete en estado <b>PENDIENTE</b> a un mensajero en estado <b>DISPONIBLE</b>.</p>
                        
                        {/* Mensaje de estado de Asignación */}
                        <div className={`alert ${mensajeAsignacion.includes('✅') ? 'alert-success' : mensajeAsignacion.includes('❌') ? 'alert-danger' : 'alert-info'}`} role="alert">
                            {mensajeAsignacion}
                        </div>
                        
                        <div className="form-group mb-3">
                            <label htmlFor="idPaquete">ID del Paquete PENDIENTE:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="idPaquete"
                                value={idPaquete}
                                onChange={(e) => setIdPaquete(e.target.value)}
                                placeholder="Ej: P001"
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label htmlFor="idMensajero">ID del Mensajero DISPONIBLE:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="idMensajero"
                                value={idMensajero}
                                onChange={(e) => setIdMensajero(e.target.value)}
                                placeholder="Ej: M001"
                            />
                        </div>
                        <button
                            className="btn btn-primary w-100"
                            onClick={handleAsignacionManual}
                        >
                            Asignar Paquete a Mensajero
                        </button>
                    </div>
                </div>

                {/* -------------------- CAJA 2: FINALIZACIÓN DE ENTREGA -------------------- */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm p-4">
                        <h3 className="card-title">Actualizador de Estado de Envío (ENTREGADO)</h3>
                        <p className="text-muted">Utilidad para forzar la transición de un paquete de <b>EN_TRANSITO</b> a <b>ENTREGADO</b>.</p>
                        
                        {/* Mensaje de estado de Entrega */}
                        <div className={`alert ${mensajeEntrega.includes('✅') ? 'alert-success' : mensajeEntrega.includes('❌') ? 'alert-danger' : 'alert-info'}`} role="alert">
                            {mensajeEntrega}
                        </div>

                        <div className="form-group mb-4">
                            <label htmlFor="idPaqueteEntrega">ID del Paquete:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="idPaqueteEntrega"
                                value={idPaqueteEntrega}
                                onChange={(e) => setIdPaqueteEntrega(e.target.value)}
                                placeholder="Ej: P001"
                            />
                        </div>
                        <button
                            className="btn btn-success w-100"
                            onClick={handleFinalizarEntrega}
                        >
                            Marcar como Entregado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsignacionManual;