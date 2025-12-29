import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function EnvioStateUpdater() {
    const [paqueteId, setPaqueteId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setPaqueteId(e.target.value.toUpperCase().trim());
        setMessage(null);
        setError(null);
    };

    const handleEntregar = async (e) => {
        e.preventDefault();
        
        if (!paqueteId) {
            setError('Ingresa un ID de paquete válido.');
            return;
        }

        if (!window.confirm(`¿Marcar el paquete ${paqueteId} como ENTREGADO? Esto solo funciona si está EN_TRANSITO.`)) {
            return;
        }

        setLoading(true);
        setMessage('Procesando...');
        setError(null);

        try {
            // Endpoint: PUT /api/envios/{id}/estado
            await axios.put(`${API_BASE_URL}/envios/${paqueteId}/estado`, `"ENTREGADO"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            setMessage(`🚚 Paquete ${paqueteId} marcado como ENTREGADO exitosamente. Mensajero liberado.`);
            setPaqueteId('');
        } catch (err) {
            console.error('Error al entregar paquete:', err);
            const serverMessage = err.response?.data || 'Error de conexión.';
            setError(`❌ Error: ${serverMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h3>Actualizador de Estado de Envío (ENTREGADO)</h3>
            <p>Utilidad para forzar la transición de un paquete de **EN_TRANSITO** a **ENTREGADO**.</p>
            
            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.message}>{message}</p>}

            <form onSubmit={handleEntregar} style={styles.form}>
                <label htmlFor="paqueteId">ID del Paquete:</label>
                <input 
                    type="text" 
                    id="paqueteId" 
                    value={paqueteId} 
                    onChange={handleChange} 
                    required 
                    style={styles.input}
                    placeholder="Ej: PQ-001"
                />
                
                <button type="submit" disabled={loading} style={styles.submitButton}>
                    {loading ? 'Entregando...' : 'Marcar como Entregado'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: { padding: '15px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px', margin: '20px auto', backgroundColor: '#f9f9f9' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    submitButton: { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    error: { color: 'red', fontWeight: 'bold' },
    message: { color: 'green', fontWeight: 'bold' }
};

export default EnvioStateUpdater;