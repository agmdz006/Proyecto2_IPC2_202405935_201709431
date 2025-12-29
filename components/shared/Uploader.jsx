// src/components/shared/Uploader.jsx

import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function Uploader() {
    const [archivo, setArchivo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'text/xml' && !file.name.toLowerCase().endsWith('.xml')) {
             setError('Por favor, selecciona un archivo con extensión .xml.');
             setArchivo(null);
             return;
        }
        setArchivo(file);
        setMessage(null);
        setError(null);
    };

    const handleUpload = async () => {
        if (!archivo) {
            setError('Por favor, selecciona un archivo XML.');
            return;
        }

        // Advertencia antes de sobrescribir los datos en memoria
        if (!window.confirm(`¿Está seguro de cargar ${archivo.name}? Esto SOBRESCRIBIRÁ toda la información actual en memoria (Centros, Rutas, etc.).`)) {
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', archivo);

            // Endpoint: POST /api/importar
            const response = await axios.post(`${API_BASE_URL}/importar`, formData, {
                headers: {
                    
                },
            });

            setMessage(` Carga de XML exitosa: ${response.data}`);
        } catch (err) {
            const serverMessage = err.response?.data || 'Error de conexión con el backend.';
            setError(` Error durante la carga: ${serverMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2> Carga Inicial de Configuración XML</h2>
            <p>Utiliza esta herramienta para poblar el sistema logístico con datos iniciales.</p>

            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.message}>{message}</p>}

            <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".xml"
                style={styles.fileInput}
            />

            <button 
                onClick={handleUpload} 
                disabled={loading || !archivo}
                style={{ ...styles.button, backgroundColor: loading || !archivo ? '#6c757d' : '#007bff' }}
            >
                {loading ? 'Procesando XML...' : 'Procesar Archivo de Entrada'}
            </button>

            {archivo && <p style={styles.fileName}>Archivo seleccionado: **{archivo.name}**</p>}
        </div>
    );
}

const styles = {
    container: { padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    error: { color: 'red', fontWeight: 'bold' },
    message: { color: 'green', fontWeight: 'bold' },
    fileInput: { marginBottom: '15px', display: 'block' },
    button: { padding: '10px 20px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.2s' },
    fileName: { marginTop: '10px', fontSize: '0.9em', color: '#555' }
};

export default Uploader;