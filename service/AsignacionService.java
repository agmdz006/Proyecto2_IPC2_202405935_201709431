
package service;

import model.Paquete;
import model.Mensajero;
import model.Ruta;
import model.AsignacionManualDTO;
import repository.DataStore;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AsignacionService {

    private final DataStore dataStore;
    private final PaqueteService paqueteService;
    private final MensajeroService mensajeroService;
    private final RutaService rutaService; // Necesario para calcular la ruta

    public AsignacionService(DataStore dataStore, PaqueteService paqueteService, MensajeroService mensajeroService, RutaService rutaService) {
        this.dataStore = dataStore;
        this.paqueteService = paqueteService;
        this.mensajeroService = mensajeroService;
        this.rutaService = rutaService;
    }


    public Paquete asignarPaquete(AsignacionManualDTO dto) throws Exception {

        // 1. Validar Paquete
        Paquete paquete = paqueteService.buscarPaquete(dto.getIdPaquete());
        if (paquete == null) {
            throw new Exception("El paquete '" + dto.getIdPaquete() + "' no existe.");
        }
        if (!"PENDIENTE".equals(paquete.getEstado())) {
            throw new Exception("El paquete " + paquete.getId() + " no está PENDIENTE. Estado actual: " + paquete.getEstado());
        }

        // 2. Validar Mensajero
        Mensajero mensajero = mensajeroService.buscarMensajero(dto.getIdMensajero());
        if (mensajero == null) {
            throw new Exception("El mensajero '" + dto.getIdMensajero() + "' no existe.");
        }
        if (!"DISPONIBLE".equals(mensajero.getEstado())) {
            throw new Exception("El mensajero " + mensajero.getId() + " no está DISPONIBLE. Estado actual: " + mensajero.getEstado());
        }


        Optional<Ruta> ruta = rutaService.encontrarRuta(paquete.getCentroActual(), paquete.getDestino());
        if (!ruta.isPresent()) {
            throw new Exception("No existe una ruta directa entre el centro actual del paquete (" + paquete.getCentroActual() + ") y el destino (" + paquete.getDestino() + ").");
        }


        paquete.setEstado("EN_TRANSITO");
        paquete.setMensajeroAsignado(mensajero.getId());

        // b) Actualizar Mensajero
        mensajero.setEstado("EN_RUTA");
        mensajero.setPaqueteActualId(paquete.getId());

        System.out.println("ASIGNACIÓN MANUAL EXITOSA: Paquete " + paquete.getId() + " asignado a Mensajero " + mensajero.getId() + " en ruta " + ruta.get().getId());

        return paquete;
    }
}