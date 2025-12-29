
package repository;

import model.Mensajero; // Usamos la clase Mensajero que proporcionaste
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Repositorio en memoria para la gestión de objetos Mensajero.
 * Simula la persistencia mediante un HashMap.
 */
@Repository
public class MensajeroRepository {

    // Almacenamiento central en memoria (ID del mensajero, Objeto Mensajero)
    private final Map<String, Mensajero> mensajeros = new HashMap<>();

    /**
     * Guarda un mensajero (inserta si es nuevo o actualiza si ya existe).
     */
    public Mensajero save(Mensajero mensajero) {
        // Usa el ID del mensajero como clave.
        mensajeros.put(mensajero.getId(), mensajero);
        return mensajero;
    }

    /**
     * Busca un mensajero por su ID.
     */
    public Mensajero findById(String id) {
        return mensajeros.get(id);
    }

    /**
     * Obtiene todos los mensajeros.
     */
    public Collection<Mensajero> findAll() {
        return mensajeros.values();
    }

    /**
     * Elimina un mensajero por su ID.
     */
    public void deleteById(String id) {
        mensajeros.remove(id);
    }

    // Puedes agregar aquí un método para cargar la data desde el XML inicial.
}