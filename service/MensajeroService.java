
package service;

import model.Mensajero;
import repository.DataStore;
import repository.MensajeroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException; // Para manejar el error 404 (Not Found)

@Service
public class MensajeroService {

    @Autowired
    private MensajeroRepository mensajeroRepository;


    public Mensajero createMensajero(Mensajero nuevoMensajero) {
        if (mensajeroRepository.findById(nuevoMensajero.getId()) != null) {
            throw new IllegalArgumentException("Ya existe un mensajero con ID " + nuevoMensajero.getId());
        }
        // El estado se inicializa como "DISPONIBLE" en el constructor de Mensajero
        return mensajeroRepository.save(nuevoMensajero);
    }

    /**
     * PUT /api/mensajeros/{id}: Actualiza datos básicos (Nombre y Capacidad).
     */
    public Mensajero updateDatosBasicos(String id, Mensajero datosNuevos) {
        Mensajero mensajeroExistente = mensajeroRepository.findById(id);

        if (mensajeroExistente == null) {
            throw new NoSuchElementException("Mensajero con ID " + id + " no encontrado.");
        }

        // Actualizar solo los campos modificables desde el formulario general:
        mensajeroExistente.setNombre(datosNuevos.getNombre());
        mensajeroExistente.setCapacidad(datosNuevos.getCapacidad());

        return mensajeroRepository.save(mensajeroExistente);
    }


    /**
     * PUT /api/mensajeros/{id}/estado: Cambia el estado operativo.
     */
    public Mensajero cambiarEstado(String id, String nuevoEstado) {
        Mensajero mensajero = mensajeroRepository.findById(id);

        if (mensajero == null) {
            throw new NoSuchElementException("Mensajero con ID " + id + " no encontrado.");
        }

        String estadoCapitalizado = nuevoEstado.toUpperCase();

        // Regla de Negocio 117: Los estados válidos son DISPONIBLE y EN_TRANSITO.
        if (!estadoCapitalizado.equals("DISPONIBLE") && !estadoCapitalizado.equals("EN_TRANSITO")) {
            throw new IllegalArgumentException("Estado no válido: " + nuevoEstado + ".");
        }

        mensajero.setEstado(estadoCapitalizado);
        return mensajeroRepository.save(mensajero);
    }

    /**
     * PUT /api/mensajeros/{id}/centro: Reasigna el centro base.
     */
    public Mensajero reasignarCentro(String id, String nuevoCentroId) {
        Mensajero mensajero = mensajeroRepository.findById(id);

        if (mensajero == null) {
            throw new NoSuchElementException("Mensajero con ID " + id + " no encontrado.");
        }

        // Regla de Negocio 118: Un mensajero en tránsito no puede ser reasignado a otro centro.
        if (mensajero.getEstado().equalsIgnoreCase("EN_TRANSITO")) {
            throw new IllegalStateException("No se puede reasignar el centro: el mensajero está EN_TRANSITO.");
        }


        mensajero.setCentro(nuevoCentroId);
        return mensajeroRepository.save(mensajero);
    }


    public Mensajero buscarMensajero(String idMensajero) {
        if (idMensajero == null || idMensajero.isEmpty()) {
            return null;
        }

        return mensajeroRepository.findById(idMensajero);
    }
}

