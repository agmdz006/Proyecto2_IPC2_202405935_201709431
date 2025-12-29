import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

function CentrosList() {
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    // Para ver información adicional de un centro 
    const [detalleVisible, setDetalleVisible] = useState(null); 
    const [detalleCargado, setDetalleCargado] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);


    const fetchCentros = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Endpoint: GET /api/centros
            const response = await axios.get(`${API_BASE_URL}/centros`);
            setCentros(response.data);
        } catch (err) {
            console.error('Error al obtener centros:', err);
            setError(' Error al cargar la lista de centros. Asegúrate de que el backend esté ejecutándose.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCentros();
    }, [fetchCentros]);
    
    // Función para obtener (paquetes o mensajeros)
    const fetchSubRecurso = async (id, recurso) => {
        if (detalleVisible === `${id}-${recurso}`) {
            setDetalleVisible(null); // Ocultar si ya está abierto
            return;
        }

        setLoadingDetalle(true);
        setDetalleCargado(null);
        setDetalleVisible(`${id}-${recurso}`);
        
        try {
            // Endpoint: GET /api/centros/{id}/paquetes O GET /api/centros/{id}/mensajeros
            const response = await axios.get(`${API_BASE_URL}/centros/${id}/${recurso}`);
            
            // Procesamos la respuesta para mostrarla
            let data = response.data;
            if (recurso === 'paquetes') {
                data = data.map(p => `ID: ${p.id} (Peso: ${p.peso}kg, Destino: ${p.destino})`).join('\n');
            } else if (recurso === 'mensajeros') {
                 data = data.map(m => `ID: ${m.id} | Nombre: ${m.nombre} (Estado: ${m.estado})`).join('\n');
            }
            
            setDetalleCargado(data);
        } catch (err) {
            setDetalleCargado(`Error al cargar ${recurso}: ${err.response?.data || 'Conexión fallida'}`);
        } finally {
            setLoadingDetalle(false);
        }
    };


    if (loading) return <p>Cargando Centros de Distribución...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="centros-list-container">
            <h2> Centros de Distribución ({centros.length})</h2>
            
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {centros.length === 0 ? (
                <p>No hay centros cargados en el sistema. Por favor, realiza la carga inicial XML.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Ciudad</th>
                            <th style={styles.th}>Capacidad Máxima</th>
                            <th style={styles.th}>Uso Actual</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {centros.map((c) => {
                            // Cálculo del porcentaje de uso 
                            const porcentajeUso = (c.cargaActual / c.capacidad) * 100;

                            return (
                                <React.Fragment key={c.id}>
                                    <tr>
                                        <td style={styles.td}>**{c.id}**</td>
                                        <td style={styles.td}>{c.nombre}</td>
                                        <td style={styles.td}>{c.ciudad}</td>
                                        <td style={styles.td}>{c.capacidad} paquetes</td>
                                        <td style={styles.td}>
                                            {c.cargaActual} ({porcentajeUso.toFixed(1)}%)
                                            <div style={{ ...styles.progressBarContainer, borderColor: porcentajeUso > 80 ? 'red' : 'green' }}>
                                                <div style={{ ...styles.progressBar, width: `${Math.min(porcentajeUso, 100)}%`, backgroundColor: porcentajeUso > 80 ? 'red' : '#28a745' }}></div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <button 
                                                onClick={() => fetchSubRecurso(c.id, 'paquetes')} 
                                                style={styles.detailButton}
                                            >
                                                {detalleVisible === `${c.id}-paquetes` ? 'Ocultar Paquetes' : 'Ver Paquetes'}
                                            </button>
                                            <button 
                                                onClick={() => fetchSubRecurso(c.id, 'mensajeros')} 
                                                style={{...styles.detailButton, backgroundColor: '#ffc107', color: 'black'}}
                                            >
                                                {detalleVisible === `${c.id}-mensajeros` ? 'Ocultar Mensajeros' : 'Ver Mensajeros'}
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Fila expandida para mostrar detalles */}
                                    {detalleVisible && detalleVisible.startsWith(c.id) && (
                                        <tr>
                                            <td colSpan="6" style={styles.detailRow}>
                                                <h4 style={{marginTop: '0'}}>Detalle de {detalleVisible.endsWith('paquetes') ? 'Paquetes' : 'Mensajeros'}:</h4>
                                                {loadingDetalle && detalleVisible.startsWith(c.id) ? (
                                                    <p>Cargando...</p>
                                                ) : (
                                                    <pre style={styles.preContent}>{detalleCargado}</pre>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const styles = {
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9em' },
    th: { border: '1px solid #ddd', padding: '10px', backgroundColor: '#f2f2f2', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '10px', textAlign: 'left', verticalAlign: 'top' },
    progressBarContainer: { height: '10px', width: '100%', backgroundColor: '#eee', borderRadius: '5px', marginTop: '5px', border: '1px solid' },
    progressBar: { height: '100%', borderRadius: '5px', transition: 'width 0.5s' },
    detailButton: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 10px', cursor: 'pointer', borderRadius: '3px', marginRight: '5px' },
    detailRow: { backgroundColor: '#f9f9f9', padding: '15px', border: '1px solid #ddd' },
    preContent: { whiteSpace: 'pre-wrap', backgroundColor: '#eee', padding: '10px', borderRadius: '4px', fontSize: '0.9em' }
};

export default CentrosList;