
import React, { useState } from 'react';
import axios from 'axios';

const ENDPOINT_REPORTE = 'http://localhost:8080/api/reporte'; // RUTA base para el reporte

function ReporteButton() { 
    
    // Estados para la experiencia del usuario
    const [estadoProcesando, setEstadoProcesando] = useState(false);
    const [mensajeFeedback, setMensajeFeedback] = useState(null);

    
    const iniciarDescargaDeReporte = async () => {
        setEstadoProcesando(true);
        setMensajeFeedback(null);

        try {
            // Petición GET al backend. 
            
            const respuesta = await axios.get(ENDPOINT_REPORTE, {
               
            });

            const xmlTexto = respuesta.data;
            
            if (!xmlTexto || xmlTexto.trim() === "") {
                 throw new Error("El backend devolvió un contenido XML vacío.");
            }

            //Crear una URL temporal para el objeto binario (blob)
            //Creamos el Blob 
            const blob = new Blob([xmlTexto], { type: 'application/xml' }); 
            const urlBlob = window.URL.createObjectURL(blob);
            
            // Crear un elemento <a> invisible para forzar la descarga
            const enlaceDescarga = document.createElement('a');
            
            // Asignar el enlace y el nombre del archivo
            enlaceDescarga.href = urlBlob;
            
            // Usamos una fecha para asegurar un nombre de archivo único
            const fechaHoy = new Date().toISOString().slice(0, 10);
            enlaceDescarga.setAttribute('download', `reporte_logistica_${fechaHoy}.xml`);
            
            // Simular el clic en el elemento 
            document.body.appendChild(enlaceDescarga);
            enlaceDescarga.click();
            
            // remover el elemento y la URL temporal
            enlaceDescarga.remove();
            window.URL.revokeObjectURL(urlBlob);

            setMensajeFeedback(' El archivo XML ha sido generado y la descarga ha comenzado exitosamente.');

        } catch (error) {
            console.error('Fallo al generar el reporte:', error);
            
            let errorMsg = 'Error crítico al intentar generar o descargar el reporte XML.';
            if (error.response && error.response.status === 500) {
                 errorMsg = 'Error 500: Fallo interno del servidor al crear el XML.';
            } else if (error.message) {
                 errorMsg = `Error: ${error.message}`;
            }

            setMensajeFeedback(` ${errorMsg}`);
            
        } finally {
           
            setEstadoProcesando(false);
        }
    };
    

    const claseBoton = estadoProcesando ? "boton-secundario boton-deshabilitado" : "boton-secundario";
    
    return (
        <div className="contenedor-reporte-unico">
            <h2 className="titulo-seccion">Generación de Reporte XML Final</h2>
            <p className="descripcion">Presione el botón para solicitar al servidor la consolidación de todos los datos en el formato XML requerido para la evaluación.</p>
            
            {/* Mensajes de feedback */}
            {mensajeFeedback && (
                <p className={mensajeFeedback.startsWith('✅') ? 'mensaje-exito' : 'mensaje-error'}>
                    {mensajeFeedback}
                </p>
            )}

            <button 
                onClick={iniciarDescargaDeReporte} 
                disabled={estadoProcesando}
                className={claseBoton}
            >
                {estadoProcesando ? 'Generando y Preparando Descarga...' : 'Descargar Reporte XML Consolidado'}
            </button>
            
            <small className="nota-deshabilitada">Requiere que el backend esté ejecutándose correctamente en el puerto 8080.</small>
        </div>
    );
}

export default ReporteButton;