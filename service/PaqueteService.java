
package service;

import model.Paquete;
import repository.DataStore;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PaqueteService {

    private final DataStore dataStore;

    /**
     * Constructor que inyecta el repositorio de datos.
     */
    public PaqueteService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    /**
     * Busca un Paquete por su identificador único.
     */
    public Paquete buscarPaquete(String idPaquete) {
        if (idPaquete == null || idPaquete.isEmpty()) {
            return null;
        }

        // Se busca el paquete en la lista principal del DataStore.
        Optional<Paquete> paqueteEncontrado = dataStore.getPaquetes().stream()
                .filter(p -> idPaquete.equals(p.getId()))
                .findFirst();

        return paqueteEncontrado.orElse(null);
    }

    /**
     * Registra un nuevo paquete en el DataStore, asumiendo que ya fue validado.
     * Este método se usaría, por ejemplo, al procesar un POST de un nuevo paquete.
     */
    public void registrarPaquete(Paquete nuevoPaquete) {
        if (nuevoPaquete == null) {
            System.err.println("Advertencia: Intento de registrar un paquete nulo.");
            return;
        }

        if (buscarPaquete(nuevoPaquete.getId()) != null) {
            System.err.println("Advertencia: Paquete con ID " + nuevoPaquete.getId() + " ya existe. Sobreescribiendo.");
            // En un sistema real, se lanzaría una excepción.
        }

        this.dataStore.getPaquetes().add(nuevoPaquete);
        System.out.println("Paquete guardado con exito: " + nuevoPaquete.getId());
    }

    /**
     * Obtiene todos los paquetes almacenados.
     */
    public List<Paquete> obtenerTodosLosPaquetes() {
        return dataStore.getPaquetes();
    }


}
