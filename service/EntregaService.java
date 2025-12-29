
package service;

import model.Paquete;
import model.Mensajero;
import org.springframework.stereotype.Service;
import java.util.NoSuchElementException;

@Service
public class EntregaService {

    private final PaqueteService paqueteService;
    private final MensajeroService mensajeroService;

    // dependencias
    public EntregaService(PaqueteService paqueteService, MensajeroService mensajeroService) {
        this.paqueteService = paqueteService;
        this.mensajeroService = mensajeroService;
    }

    /**
     * Finaliza la entrega de un paquete y libera al mensajero.
     */
    public Paquete finalizarEntrega(String idPaquete) throws Exception {

        //  Validar y obtener Paquete
        Paquete paquete = paqueteService.buscarPaquete(idPaquete);
        if (paquete == null) {
            throw new NoSuchElementException("El paquete con ID " + idPaquete + " no fue encontrado en el sistema.");
        }

        // El paquete debe estar en tránsito para poder ser entregado
        if (!"EN_TRANSITO".equals(paquete.getEstado())) {
            throw new IllegalStateException("Error: El paquete " + idPaquete + " no está en EN_TRANSITO. Estado actual: " + paquete.getEstado());
        }

        String idMensajero = paquete.getMensajeroAsignado();

        // Actualizar Paquete
        paquete.setEstado("ENTREGADO");

        //  Actualizar Mensajero
        if (idMensajero != null) {
            Mensajero mensajero = mensajeroService.buscarMensajero(idMensajero);
            if (mensajero != null) {

                // Liberar al mensajero
                mensajero.setEstado("DISPONIBLE");
                mensajero.setPaqueteActualId(null);
            }
        }

        System.out.println("LOGISTICA: Entrega finalizada para paquete " + idPaquete + ". Mensajero " + idMensajero + " liberado.");
        return paquete;
    }
}