package controller;

import model.Mensajero;
import model.Paquete;
import repository.DataStore;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/envios")
@CrossOrigin(origins = "*")
public class EnvioController {

    @Autowired
    DataStore datos;


    @PutMapping("/asignar")
    // ester endop}int lo usaremos cuando querramos hacer una asignacion manual esto pero tambien jala el automatico
    public ResponseEntity<String> asignarManual(@RequestBody Map<String, String> body) {
        String idPaquete = body.get("paqueteId");
        String idMensajero = body.get("mensajeroId");

        System.out.println("Asignacion manual: " + idPaquete + " -> " + idMensajero);
        // no olvidar ponerlo nulo para no dar error
        Paquete elPaquete = null;
        for (Paquete p : datos.getPaquetes()) {
            if (p.getId().equals(idPaquete)) {
                elPaquete = p;
                break;
            }
        }
        if (elPaquete == null) return ResponseEntity.badRequest().body("Error: Paquete no existe.");
// no olvidar ponerlo nulo para no dar error
        Mensajero elMensajero = null;
        for (Mensajero m : datos.getMensajeros()) {
            if (m.getId().equals(idMensajero)) {
                elMensajero = m;
                break;
            }
        }
        // tener mucho cuidado un mensaje debemos primero o insertarlo o si no dara errror que no existe o mejor ponerle el paquete a otro mensajero
        if (elMensajero == null) return ResponseEntity.badRequest().body("Error: Mensajero no existe.");

        // Validaciones  para validar el centros
        if (!elPaquete.getCentroActual().equals(elMensajero.getCentro())) {
            return ResponseEntity.badRequest().body("Error: Deben estar en el mismo centro.");
        }
        // ti po aquí debe ser o pendiente o dispnible si no marca error
        if (!elPaquete.getEstado().equals("PENDIENTE")) {
            return ResponseEntity.badRequest().body("Error: El paquete no esta PENDIENTE.");
        }
        if (!elMensajero.getEstado().equals("DISPONIBLE")) {
            return ResponseEntity.badRequest().body("Error: El mensajero no esta DISPONIBLE.");
        }

        // valores cuando se mande el envio en proceso
        elPaquete.setEstado("EN_TRANSITO");
        elMensajero.setEstado("EN_TRANSITO");

        return ResponseEntity.ok("Asignacion completada.");
    }

    @PutMapping("/{id}/estado")
    // este endpoin lo usaras para actualizar el estados de un envio
    public ResponseEntity<String> actualizarEstado(@PathVariable String id, @RequestBody String nuevoEstado) {
        // adjuntar evidencia cuando el paquete cambie de estadito
        System.out.println("Cambio de estado para paquete: " + id);
        // apara limpiar caracteres
        String estadoLimpio = nuevoEstado.replace("\"", "").trim();
            // recoerda que los paquewtes no debe ser nulos
        Paquete paqueteEncontrado = null;
        for (Paquete p : datos.getPaquetes()) {
            if (p.getId().equals(id)) {
                paqueteEncontrado = p;
                break;
            }
        }
        // esto pasa cuando el paquete lo mandamos a llamar a un lugar inexistente
        if (paqueteEncontrado == null) return ResponseEntity.status(404).body("Error: Paquete no encontrado.");

        String estadoActual = paqueteEncontrado.getEstado();

        // Validaciones de Transición para la parte de envios
        if (estadoActual.equals("ENTREGADO")) {
            return ResponseEntity.badRequest().body("Error: Ya fue entregado.");
        }
        // siempre debe primero debe pasar por el transito para llegar al destino
        if (estadoActual.equals("PENDIENTE") && estadoLimpio.equals("ENTREGADO")) {
            return ResponseEntity.badRequest().body("Error: Debe pasar por EN_TRANSITO.");
        }
        // cuando llegue aquí no se puede reverir
        if (estadoActual.equals("EN_TRANSITO") && estadoLimpio.equals("PENDIENTE")) {
            return ResponseEntity.badRequest().body("Error: No se puede revertir.");
        }

        //aqui aplicamos el cambios
        paqueteEncontrado.setEstado(estadoLimpio);
        String timeStamp = LocalDateTime.now().toString();
        System.out.println("Nuevo estado: " + estadoLimpio + " | Hora: " + timeStamp);

        // cada que le den a finalizar un viajes y liberar el mensajero  es una regla
        if (estadoLimpio.equals("ENTREGADO")) {
            System.out.println("Paquete entregado. Finalizando logistica...");

            // Guardamos donde estaba el paquete antes de actualizarlo
            String centroOrigenViaje = paqueteEncontrado.getCentroActual();
            String centroDestinoViaje = paqueteEncontrado.getDestino();

            //  Mover el paquete al destino final
            paqueteEncontrado.setCentroActual(centroDestinoViaje);

            //  Buscar al mensajero que venia del origen
            boolean mensajeroLiberado = false;

            for (Mensajero m : datos.getMensajeros()) {
                // Buscamos un mensajero EN_TRANSITO que siga registrado en el origen del viaje
                if (m.getEstado().equals("EN_TRANSITO") && m.getCentro().equals(centroOrigenViaje)) {


                    //m.setCentro(centroDestinoViaje); // Lo movemos al destino
                    m.setEstado("DISPONIBLE");       // Lo liberamos

                    System.out.println("Mensajero " + m.getNombre() + " viajo de " + centroOrigenViaje + " a " + centroDestinoViaje + " y esta LIBRE.");
                    mensajeroLiberado = true;
                    break;
                }
            }
    // por si las moscas lo ponemos ya que el mensajero no esta donde se pide
            if (!mensajeroLiberado) {
                System.out.println("Nota: No se encontro mensajero en el origen para mover. (Tal vez ya estaba en destino)");
            }
        }

        return ResponseEntity.ok("Estado actualizado a " + estadoLimpio);
    }
}