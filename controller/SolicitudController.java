package controller;

import model.Mensajero;
import model.Paquete;
import model.Solicitud;
import repository.DataStore;
import service.RutaService;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*")
public class SolicitudController {

    @Autowired
    DataStore dataStore;

    @Autowired
    RutaService servicioRutas;

    private static class EstadoMensajeroTemporal {
        Mensajero mensajeroReal;
        double capacidadRestante;
        String destinoActual; // Para asegurar que agrupe paquetes al mismo destino
        // solo usamos para tener mejor vista de erorres
        public EstadoMensajeroTemporal(Mensajero m) {
            this.mensajeroReal = m;
            this.capacidadRestante = m.getCapacidad();
            this.destinoActual = null;
        }
    }

    //  aqui esta funcion nos sirve para poder ver toda la cola en el sistema
    @GetMapping
    public List<Solicitud> verCola() {
        List<Solicitud> cola = dataStore.getSolicitudes();
        if (cola == null) return new ArrayList<>();

        // ordenar por prioridad de mayor a menor aqui pues usaremos burjujita
        for (int i = 0; i < cola.size(); i++) {
            for (int j = 0; j < cola.size() - 1; j++) {
                if (cola.get(j).getPrioridad() < cola.get(j + 1).getPrioridad()) {
                    // Intercambio manual de posiciones
                    Solicitud _temp = cola.get(j);
                    cola.set(j, cola.get(j + 1));
                    cola.set(j + 1, _temp);
                }
            }
        }
        return cola;
    }

    // aqui creamos un soli esta funciona valindadoo que exista un paquete mensajero en ssistema si no te darar error
    @PostMapping
    public ResponseEntity<String> crearSolicitud(@RequestBody Solicitud nueva) {
        boolean paqueteExiste = false;
        if (dataStore.getPaquetes() != null) {
            for (Paquete p : dataStore.getPaquetes()) {
                if (p.getId().equals(nueva.getPaquete())) {
                    paqueteExiste = true;
                    if (!p.getEstado().equals("PENDIENTE")) {
                        return ResponseEntity.badRequest().body("Error: El paquete ya no esta pendiente");
                    }
                    break;
                }
            }
        }
        if (!paqueteExiste) {
            return ResponseEntity.badRequest().body("Error: El paquete no existe");
        }
        dataStore.getSolicitudes().add(nueva);
        return ResponseEntity.ok("Solicitud agregada a la cola");
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> borrarSolicitud(@PathVariable String id) {
        Solicitud aBorrar = null;
        for (Solicitud s : dataStore.getSolicitudes()) {
            if (s.getId().equals(id)) {
                aBorrar = s;
                break;
            }
        }
        if (aBorrar != null) {
            dataStore.getSolicitudes().remove(aBorrar);
            return ResponseEntity.ok("Solicitud eliminada.");
        }
        return ResponseEntity.status(404).body("No encontrada");
    }

    //  PROCESAR LA DE MAYOR PRIORIDAD
    @PostMapping("/procesar")
    public ResponseEntity<String> procesarTop1() {

        return procesarLogica(1);
    }

    // PROCESAR LAS N MAS PRIORITARIAS
    @PostMapping("/procesar/{n}")
    public ResponseEntity<String> procesarTopN(@PathVariable int n) {

        return procesarLogica(n);
    }

    // carga multiple
    private ResponseEntity<String> procesarLogica(int cantidadAProcesar) {
        List<Solicitud> cola = dataStore.getSolicitudes();
        if (cola == null || cola.isEmpty()) {
            return ResponseEntity.ok("La cola esta vacia");
        }

        //  Ordenar por prioridad (Lo mas urgente primero)
        int _n_cola = cola.size();
        for (int x = 0; x < _n_cola; x++) {
            for (int y = 0; y < _n_cola - 1; y++) {
                // Si el actual es menor al siguiente, los movemos (Prioridad alta al inicio)
                if (cola.get(y).getPrioridad() < cola.get(y + 1).getPrioridad()) {
                    Solicitud _aux_sol = cola.get(y);
                    cola.set(y, cola.get(y + 1));
                    cola.set(y + 1, _aux_sol);
                }
            }
        }

        int procesados = 0;
        int errores = 0;
        List<Solicitud> completadas = new ArrayList<>();

        // cuanto espacio le queda en este viaje
        Map<String, EstadoMensajeroTemporal> usoMensajeros = new HashMap<>();

        // Iteramos las solicitudes
        for (int i = 0; i < cola.size(); i++) {
            if (procesados >= cantidadAProcesar) break;

            Solicitud sol = cola.get(i);

            //  Buscar paquete
            Paquete elPaquete = null;
            if (dataStore.getPaquetes() != null) {
                for (Paquete p : dataStore.getPaquetes()) {
                    if (p.getId().equals(sol.getPaquete())) {
                        elPaquete = p;
                        break;
                    }
                }
            }

            if (elPaquete == null || !elPaquete.getEstado().equals("PENDIENTE")) {
                errores++; continue;
            }

            String origen = elPaquete.getCentroActual();
            String destino = elPaquete.getDestino();
            double pesoPaquete = elPaquete.getPeso();

            // Validar ruta
            if (servicioRutas.buscarRuta(origen, destino).isEmpty()) {
                System.out.println("Salto solicitud: Sin ruta");
                errores++; continue;
            }


            EstadoMensajeroTemporal candidato = null;

            // Buscar si ya estamos llenando un mensajero para esa ruta
            for (EstadoMensajeroTemporal temp : usoMensajeros.values()) {
                if (temp.mensajeroReal.getCentro().equals(origen) &&    // Mismo origen
                        temp.destinoActual.equals(destino) &&               // Mismo destino
                        temp.capacidadRestante >= pesoPaquete) {            // Cabe el paquete

                    candidato = temp;
                    break;
                }
            }

            // Si no hay nadie saliendo, buscar uno nuevo DISPONIBLE
            if (candidato == null) {
                if (dataStore.getMensajeros() != null) {
                    for (Mensajero m : dataStore.getMensajeros()) {

                        if (!usoMensajeros.containsKey(m.getId()) &&
                                m.getCentro().equals(origen) &&
                                m.getEstado().equals("DISPONIBLE") &&
                                m.getCapacidad() >= pesoPaquete) {

                            // Creamos un nuevo estado temporal
                            candidato = new EstadoMensajeroTemporal(m);
                            candidato.destinoActual = destino; // Definimos a dónde va este viaje
                            usoMensajeros.put(m.getId(), candidato);
                            break;
                        }
                    }
                }
            }

            // resuelado de la busqueda
            if (candidato != null) {
                // Asignamos
                candidato.capacidadRestante -= pesoPaquete;
                elPaquete.setEstado("EN_TRANSITO");

                System.out.println("Asignado P: " + elPaquete.getId() + " ("+pesoPaquete+"kg) a Mensajero: " + candidato.mensajeroReal.getNombre() + " | Espacio restante: " + candidato.capacidadRestante);

                completadas.add(sol);
                procesados++;
            } else {
                System.out.println("Salto solicitud: No hay mensajero con capacidad o ruta disponible");
                errores++;
            }
        }

        for (EstadoMensajeroTemporal estado : usoMensajeros.values()) {
            estado.mensajeroReal.setEstado("EN_TRANSITO");

        }

        cola.removeAll(completadas);
        return ResponseEntity.ok("Procesamiento inteligente finalizado. Atendidas: " + procesados + ". Fallidas/Saltadas: " + errores);
    }
}