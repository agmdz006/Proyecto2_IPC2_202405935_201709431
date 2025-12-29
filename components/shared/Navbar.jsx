
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    const styles = {
        nav: { backgroundColor: '#343a40', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
        logo: { color: 'white', textDecoration: 'none', fontSize: '1.5em', fontWeight: 'bold' },
        ul: { listStyle: 'none', margin: 0, padding: 0, display: 'flex' },
        li: { marginLeft: '20px' },
        link: { color: '#adb5bd', textDecoration: 'none', fontSize: '1em', transition: 'color 0.2s' },
        linkHover: { color: 'white' }
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}> Logitrack (IPC2)</Link> 
            <ul style={styles.ul}>
                {/*  MÓDULOS DE DATOS */}
                
                {/* Separamos Rutas de Centros */}
                <li style={styles.li}>
                    <Link to="/centros" style={styles.link}>Centros</Link>
                </li>
                {/* NUEVO ENLACE PARA RUTAS */}
                <li style={styles.li}>
                    <Link to="/rutas" style={styles.link}>Rutas</Link>
                </li>
                
                <li style={styles.li}>
                    <Link to="/mensajeros" style={styles.link}>Mensajeros</Link>
                </li>
                <li style={styles.li}>
                    <Link to="/paquetes" style={styles.link}>Paquetes</Link>
                </li>

                {/* MÓDULOS DE PROCESOS Y REPORTES */}
                <li style={styles.li}>
                    <Link to="/solicitudes" style={styles.link}>Despacho</Link>
                </li>
                <li style={styles.li}>
                    <Link to="/envios/utilidades" style={styles.link}>Utilidades Envíos</Link>
                </li>
                <li style={styles.li}>
                    <Link to="/reporte" style={styles.link}>Reporte XML</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;