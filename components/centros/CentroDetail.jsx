import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

function CentroDetail() {
    const { id } = useParams(); // Obtiene el ID del centro desde la URL
    const [centro, setCentro] = useState(null);
    const [paquetes, setPaquetes] = useState([]);
    const [mensajeros, setMensajeros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('paquetes'); // Controla qué sub-listado mostrar

    // 1. Obtener detalles del Centro (GET /api/centros/{id})
    const fetchCentro = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/centros/${id}`);
            setCentro(response.data);
            return response.data; // Devolvemos el centro para usarlo en la siguiente llamada
        } catch (err) {
            setError(`No se pudo encontrar el Centro con ID: ${id}`);
            throw err;
        }
    }, [id]);

    // Obtener sub-listados (Paquetes y Mensajeros)
    const fetchSubRecursos = useCallback(async (centroData) => {
        try {
            // GET /api/centros/{id}/paquetes
            const paquetesResponse = await axios.get(`${API_BASE_URL}/centros/${id}/paquetes`);
            setPaquetes(paquetesResponse.data);

            // GET /api/centros/{id}/mensajeros
            const mensajerosResponse = await axios.get(`${API_BASE_URL}/centros/${id}/mensajeros`);
            setMensajeros(mensajerosResponse.data);

        } catch (err) {
            console.error("Error al cargar recursos asociados:", err);
            // solo advertimos en la consola
        }
    }, [id]);

    useEffect(() => {
        setLoading(true);
        const loadData = async () => {
            try {
                const centroData = await fetchCentro();
                if (centroData) {
                    await fetchSubRecursos(centroData);
                }
            } catch {
                // El error ya fue manejado en fetchCentro
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [fetchCentro, fetchSubRecursos]);


    const renderPaquetes = () => (
        <table style={styles.table}>
            <thead>
                <tr>
                    <th style={styles.th}>ID Paquete</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Peso (kg)</th>
                    <th style={styles.th}>Destino</th>
                    <th style={styles.th}>Estado</th>
                </tr>
            </thead>
            <tbody>
                {paquetes.map(p => (
                    <tr key={p.id}>
                        <td style={styles.td}><Link to={`/paquetes/editar/${p.id}`}>{p.id}</Link></td>
                        <td style={styles.td}>{p.cliente}</td>
                        <td style={styles.td}>{p.peso}</td>
                        <td style={styles.td}>{p.destino}</td>
                        <td style={{ ...styles.td, color: p.estado === 'PENDIENTE' ? 'orange' : 'blue' }}>{p.estado}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderMensajeros = () => (
        <table style={styles.table}>
            <thead>
                <tr>
                    <th style={styles.th}>ID Mensajero</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Capacidad</th>
                    <th style={styles.th}>Estado</th>
                </tr>
            </thead>
            <tbody>
                {mensajeros.map(m => (
                    <tr key={m.id}>
                        <td style={styles.td}><Link to={`/mensajeros`}>{m.id}</Link></td>
                        <td style={styles.td}>{m.nombre}</td>
                        <td style={styles.td}>{m.capacidad}</td>
                        <td style={{ ...styles.td, color: m.estado === 'DISPONIBLE' ? 'green' : 'red' }}>{m.estado}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    if (loading) return <p>Cargando detalles del Centro...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!centro) return <p>No hay datos disponibles para el Centro {id}.</p>;

    const porcentajeUso = (centro.cargaActual / centro.capacidad) * 100;

    return (
        <div style={styles.container}>
            <h2> Detalle del Centro: **{centro.nombre} ({centro.id})**</h2>
            <p><strong>Ubicación:</strong> {centro.ciudad}</p>
            <p><strong>Capacidad Total:</strong> {centro.capacidad} paquetes</p>
            <p>
                <strong>Carga Actual:</strong> {centro.cargaActual} paquetes ({porcentajeUso.toFixed(1)}%)
                <div style={styles.progressBarContainer}>
                    <div style={{ ...styles.progressBar, width: `${Math.min(porcentajeUso, 100)}%`, backgroundColor: porcentajeUso > 80 ? 'red' : '#28a745' }}></div>
                </div>
            </p>
            
            <hr style={styles.hr} />

            {/* Selector de Pestañas */}
            <div style={styles.tabContainer}>
                <button 
                    style={{ ...styles.tabButton, backgroundColor: activeTab === 'paquetes' ? '#007bff' : '#ccc' }}
                    onClick={() => setActiveTab('paquetes')}
                >
                    Paquetes en Centro ({paquetes.length})
                </button>
                <button 
                    style={{ ...styles.tabButton, backgroundColor: activeTab === 'mensajeros' ? '#007bff' : '#ccc' }}
                    onClick={() => setActiveTab('mensajeros')}
                >
                    Mensajeros Asignados ({mensajeros.length})
                </button>
            </div>

            <div style={styles.contentContainer}>
                {activeTab === 'paquetes' ? (
                    paquetes.length > 0 ? renderPaquetes() : <p>No hay paquetes almacenados en este centro.</p>
                ) : (
                    mensajeros.length > 0 ? renderMensajeros() : <p>No hay mensajeros asignados a este centro o todos están en tránsito.</p>
                )}
            </div>

            <Link to="/centros" style={styles.backButton}>← Volver a la Lista de Centros</Link>
        </div>
    );
}

const styles = {
    container: { padding: '20px', maxWidth: '900px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px' },
    progressBarContainer: { height: '15px', width: '100%', backgroundColor: '#eee', borderRadius: '5px', marginTop: '5px', border: '1px solid #999' },
    progressBar: { height: '100%', borderRadius: '5px', transition: 'width 0.5s' },
    hr: { margin: '20px 0' },
    tabContainer: { display: 'flex', marginBottom: '15px', gap: '10px' },
    tabButton: { padding: '10px 15px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', transition: 'background-color 0.3s' },
    contentContainer: { border: '1px solid #eee', padding: '15px', borderRadius: '5px', minHeight: '150px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9em' },
    th: { border: '1px solid #ddd', padding: '10px', backgroundColor: '#f2f2f2', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '10px', textAlign: 'left' },
    backButton: { display: 'inline-block', marginTop: '20px', color: '#007bff', textDecoration: 'none' }
};

export default CentroDetail;