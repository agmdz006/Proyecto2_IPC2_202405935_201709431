
package service;

import model.*;
import repository.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import java.util.ArrayList;

@Service
public class SolicitudService {

    @Autowired
    private DataStore dataStore;

    @Autowired
    private RutaService rutaService;

    // Asumo que tienes un MensajeroService implementado para cambiar estados
    @Autowired
    private MensajeroService mensajeroService;

    // Comparator basado en el atributo 'prioridad' (mayor número = mayor prioridad)
    // El método .reversed() garantiza que el valor más alto tiene la máxima prioridad.
    private static final Comparator<Solicitud> PRIORIDAD_COMPARATOR =
            Comparator.comparing(Solicitud::getPrioridad).reversed();

    /**
     * POST /api/solicitudes/procesar : Procesa la solicitud con mayor prioridad.
     */
    public String procesarUnaSolicitud() {
        // Llama a procesarNsolicitudes con n=1 y extrae el mensaje de resultado.
        List<String> resultados = procesarNsolicitudesDetallado(1);

        // Retorna el primer y único resultado (o el mensaje de fallo general)
        return resultados.isEmpty()
                ? "No hay solicitudes pendientes en la cola."
                : resultados.get(0);
    }

    /**
     * Método interno para procesar N solicitudes y devolver los mensajes detallados.
     */
    public List<String> procesarNsolicitudesDetallado(int n) {
        if (n <= 0) {
            return List.of("ERROR: El número de solicitudes a procesar debe ser mayor a 0.");
        }

        //  Crear y Llenar la Cola de Prioridad
        PriorityQueue<Solicitud> cola = new PriorityQueue<>(PRIORIDAD_COMPARATOR);
        cola.addAll(dataStore.getSolicitudes());

        if (cola.isEmpty()) {
            return new ArrayList<>(); // Lista vacía si no hay nada que procesar
        }

        List<String> mensajesDeResultado = new ArrayList<>();

        // Intentar procesar hasta 'n' solicitudes
        for (int i = 0; i < n && !cola.isEmpty(); i++) {
            Solicitud solicitud = cola.poll(); // Extrae y remueve la de mayor prioridad

            String resultado = intentarDespachoIndividual(solicitud);
            mensajesDeResultado.add("Solicitud " + solicitud.getId() + ": " + resultado);

            // Si el despacho fue exitoso, se remueve la solicitud del DataStore.
            if (resultado.startsWith("ÉXITO")) {
                dataStore.getSolicitudes().remove(solicitud);
            }
        }

        return mensajesDeResultado;
    }

    /**
     * Método para procesar N solicitudes y devolver solo la lista de IDs exitosos.
     * Útil si el Controller solo quiere saber qué IDs fueron atendidos.
     */
    public List<String> procesarNsolicitudesExitosas(int n) {
        // Reutilizamos la lógica de la cola de prioridad
        PriorityQueue<Solicitud> cola = new PriorityQueue<>(PRIORIDAD_COMPARATOR);
        cola.addAll(dataStore.getSolicitudes());

        List<String> idsExitosos = new ArrayList<>();

        for (int i = 0; i < n && !cola.isEmpty(); i++) {
            Solicitud solicitud = cola.poll();
            String resultado = intentarDespachoIndividual(solicitud);

            if (resultado.startsWith("ÉXITO")) {
                idsExitosos.add(solicitud.getId());
                dataStore.getSolicitudes().remove(solicitud);
            }
        }
        return idsExitosos;
    }


    /**
     * Lógica central de validación y despacho para una única solicitud.
     */
    private String intentarDespachoIndividual(Solicitud solicitud) {

        // ---  Buscar y Validar Paquete ---
        Paquete paquete = dataStore.getPaquetes().stream()
                .filter(p -> p.getId().equals(solicitud.getPaquete()))
                .findFirst()
                .orElse(null);

        if (paquete == null) {
            return "FALLO: Paquete referenciado '" + solicitud.getPaquete() + "' no existe.";
        }
        if (!paquete.getEstado().equals("PENDIENTE")) {
            return "FALLO: Paquete ya está en estado '" + paquete.getEstado() + "'.";
        }

        // ---  Validar Ruta (Existencia) ---
        String origen = paquete.getCentroActual();
        String destino = paquete.getDestino();

        // El método buscarRuta de RutaService devuelve la ruta (List<String>) o una lista vacía si no hay.
        List<String> ruta = rutaService.buscarRuta(origen, destino);
        if (ruta.isEmpty() || ruta.size() < 2) { // Debe haber al menos Origen y Destino
            return "FALLO: No existe ruta entre " + origen + " y " + destino + ".";
        }

        // --- Buscar Mensajero DISPONIBLE en Origen ---
        Mensajero mensajeroElegido = dataStore.getMensajeros().stream()
                .filter(m -> m.getCentro().equals(origen))
                .filter(m -> m.getEstado().equals("DISPONIBLE"))
                .findFirst()
                .orElse(null);

        if (mensajeroElegido == null) {
            return "FALLO: No hay mensajero DISPONIBLE en el centro de origen (" + origen + ").";
        }

        // ---  Validar Capacidad ---
        if (paquete.getPeso() > mensajeroElegido.getCapacidad()) {
            return "FALLO: Capacidad excedida (Mensajero: " + mensajeroElegido.getCapacidad() + ", Paquete: " + paquete.getPeso() + ").";
        }

        // --- PROCESAMIENTO (Despacho Exitoso) ---

        try {
            // a) Paquete se marca EN_TRANSITO
            paquete.setEstado("EN_TRANSITO");

            // b) El mensajero queda EN_TRANSITO
            mensajeroService.cambiarEstado(mensajeroElegido.getId(), "EN_TRANSITO");

            return "ÉXITO: Despachado al destino " + destino + " con mensajero " + mensajeroElegido.getNombre() + ". Ruta: " + String.join(" -> ", ruta);

        } catch (Exception e) {
            return "FALLO: Excepción interna al actualizar estados: " + e.getMessage();
        }
    }
}