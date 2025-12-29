package service;

import model.Ruta;
import repository.DataStore;
// Imports con wildcard
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.*;
import java.util.*;

@Service
public class RutaService {

    @Autowired
    private DataStore _db_store; // vairable

    // ========================
    // MÉTODOS CRUD
    // ========================

    public List<Ruta> obtenerTodas() {
        return _db_store.getRutas();
    }

    public Ruta buscarPorId(String id_busqueda) {
        // Cambio de foreach a for con indice
        List<Ruta> _temp_lista = _db_store.getRutas();

        for (int i = 0; i < _temp_lista.size(); i++) {
            Ruta _r = _temp_lista.get(i);
            if (_r.getId().equals(id_busqueda)) {
                return _r;
            }
        }
        return null;
    }

    // doblee bulce para crear ruta
    public void crearRuta(Ruta nueva) {
        List<Ruta> _lista = _db_store.getRutas();

        // 1. Primer barrido: Solo IDs
        for (int k = 0; k < _lista.size(); k++) {
            if (_lista.get(k).getId().equals(nueva.getId())) {
                throw new IllegalArgumentException("Error: ID duplicado -> " + nueva.getId());
            }
        }

        // 2. Segundo barrido: Origen y Destino
        // Concatenamos strings para comparar poco eficiente pero funca
        String _camino_nuevo = nueva.getOrigen() + "::" + nueva.getDestino();

        for (Ruta _r : _lista) {
            String _camino_existente = _r.getOrigen() + "::" + _r.getDestino();
            if (_camino_existente.equals(_camino_nuevo)) {
                throw new IllegalArgumentException("Error: Ruta existente " + _camino_nuevo);
            }
        }

        // Si pasa, guardamos
        _db_store.getRutas().add(nueva);
    }

    public boolean actualizarRuta(String id, Ruta datos) {
        Ruta _encontrada = buscarPorId(id);

        if (_encontrada != null) {
            // Actualizacion manual
            int _d = datos.getDistancia();
            _encontrada.setDistancia(_d);
            return true;
        }
        return false;
    }

    public boolean eliminarRuta(String id) {
        Ruta _target = buscarPorId(id);

        // Validacion explicita
        if (_target != null) {
            return _db_store.getRutas().remove(_target);
        } else {
            return false;
        }
    }

    // ==========================================
    // ALGORITMO DIJKSTRA
    // ==========================================


    public List<String> buscarRuta(String nodo_inicio, String nodo_fin) {
        // Variable "numero muy grande"
        final int _INFINITO = 9999999;

        // 1. Validacion rapida
        if (nodo_inicio.equals(nodo_fin)) {
            ArrayList<String> _simple = new ArrayList<>();
            _simple.add(nodo_inicio);
            return _simple;
        }

        List<Ruta> _todas = _db_store.getRutas();
        if (_todas == null || _todas.isEmpty()) return new ArrayList<>();

        // 2. Estructuras de datos (Nombres en español explícitos)
        Map<String, Integer> _mapa_distancias = new HashMap<>();
        Map<String, String> _mapa_padres = new HashMap<>();
        List<String> _por_visitar = new ArrayList<>();
        List<String> _ya_visitados = new ArrayList<>();

        // 3. Inicializacion manual
        for (Ruta _ruta : _todas) {
            // Inicializamos tanto origen como destino
            if (!_mapa_distancias.containsKey(_ruta.getOrigen())) {
                _mapa_distancias.put(_ruta.getOrigen(), _INFINITO);
            }
            if (!_mapa_distancias.containsKey(_ruta.getDestino())) {
                _mapa_distancias.put(_ruta.getDestino(), _INFINITO);
            }
        }

        // El nodo inicial tiene costo 0
        _mapa_distancias.put(nodo_inicio, 0);
        _por_visitar.add(nodo_inicio);

        // 4. Bucle principal
        while (_por_visitar.size() > 0) { // size > 0 pq tiene que ser mayor a 0

            // --- BUSCAR MENOR COSTO MANUALMENTE ---
            String _nodo_actual = null;
            int _menor_costo_actual = _INFINITO;

            for (int i = 0; i < _por_visitar.size(); i++) {
                String _candidato = _por_visitar.get(i);

                // Obtener costo de forma segura
                int _costo_candidato = _INFINITO;
                if (_mapa_distancias.containsKey(_candidato)) {
                    _costo_candidato = _mapa_distancias.get(_candidato);
                }

                if (_costo_candidato < _menor_costo_actual) {
                    _menor_costo_actual = _costo_candidato;
                    _nodo_actual = _candidato;
                }
            }
            // --------------------------------------

            if (_nodo_actual == null) break; // Camino sin salida

            // Mover de lista pendiente a visitados
            _por_visitar.remove(_nodo_actual);
            _ya_visitados.add(_nodo_actual);

            // Si llegamos, cortamos esto optimiza mejor
            if (_nodo_actual.equals(nodo_fin)) break;

            // --- EXAMINAR VECINOS ---
            for (Ruta _ruta : _todas) {
                // Solo nos interesan las rutas que salen de DONDE ESTOY
                if (_ruta.getOrigen().equals(_nodo_actual)) {

                    String _vecino = _ruta.getDestino();

                    // Si ya lo visite, lo salto
                    if (_ya_visitados.contains(_vecino)) continue;

                    // Calculo de costo acumulado
                    int _dist_acum = _mapa_distancias.get(_nodo_actual) + _ruta.getDistancia();

                    // Ver cuanto cuesta llegar al vecino actualmente
                    int _dist_vecino_actual = _INFINITO;
                    if (_mapa_distancias.containsKey(_vecino)) {
                        _dist_vecino_actual = _mapa_distancias.get(_vecino);
                    }

                    // Relajacion de arista
                    if (_dist_acum < _dist_vecino_actual) {
                        _mapa_distancias.put(_vecino, _dist_acum);
                        _mapa_padres.put(_vecino, _nodo_actual);

                        // Agregar a pendientes si no esta
                        if (!_por_visitar.contains(_vecino)) {
                            _por_visitar.add(_vecino);
                        }
                    }
                }
            }
        }

        // 5. Reconstruccion del camino
        List<String> _ruta_final = new ArrayList<>();

        // Verificamos si llegamos
        if (!_mapa_padres.containsKey(nodo_fin)) {
            // Retorna vacio si no hay camino
            return _ruta_final;
        }

        String _paso_atras = nodo_fin;
        while (_paso_atras != null) {
            _ruta_final.add(0, _paso_atras); // Insertar al inicio
            _paso_atras = _mapa_padres.get(_paso_atras);
        }

        return _ruta_final;
    }
}