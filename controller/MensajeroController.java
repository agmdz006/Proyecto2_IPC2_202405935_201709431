package controller;

import model.Mensajero;
import repository.DataStore;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/mensajeros")
@CrossOrigin(origins = "*")
public class MensajeroController {

    @Autowired
    DataStore datosMemoria;

    //  Ver todos los mensajeros que obtengamos del xml de entrada
    @GetMapping
    public List<Mensajero> listarMensajeros() {
        System.out.println("Listar todos los mensajeros disponibles en el sistema");

        List<Mensajero> lista = datosMemoria.getMensajeros();

        if (lista == null) {
            return new ArrayList<>();
        }

        return lista;
    }

    //  Buscar uno por ID mensajero para solo mostrar su info en especifoc
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarMensajero(@PathVariable String id) {
        System.out.println("Buscando mensajero ID: " + id);

        List<Mensajero> todos = datosMemoria.getMensajeros();
        Mensajero encontrado = null;

        // Recorremos
        for (int i = 0; i < todos.size(); i++) {
            if (todos.get(i).getId().equals(id)) {
                // cuando encontremos el valor lo guardamos en la vairalbe aux y detenemos
                encontrado = todos.get(i);
                break;
            }
        }

        if (encontrado != null) {
            return ResponseEntity.ok(encontrado);
        }
        return ResponseEntity.status(404).body("No se encontro el mensajero.");
    }

    //  Contratar nuevo mensajero pq los demas ya no dan pamas
    @PostMapping
    public ResponseEntity<String> crearMensajero(@RequestBody Mensajero nuevo) {
        System.out.println("Intentando registrar mensajero: " + nuevo.getNombre());

        // Validacion rapida de duplicados por si encontrar un mensajero con el mismo idp ues marcamos error de que exsite
        List<Mensajero> _lista_actual = datosMemoria.getMensajeros();
        boolean _ya_existe = false; // Usamos una bandera en lugar de return directo

        for (int k = 0; k < _lista_actual.size(); k++) {
            // Extraemos valores en variables temporales
            Mensajero _m_temp = _lista_actual.get(k);
            String _id_temp = _m_temp.getId();

            if (_id_temp.equals(nuevo.getId())) {
                _ya_existe = true;
                break; // Rompemos el ciclo manualmente
            }
        }

        // Verificamos la bandera afuera del bucle
        if (_ya_existe) {
            return ResponseEntity.badRequest().body("Error: Ya existe un mensajero con ese ID.");
        }

        // Si pasa, lo agregamos a la lista de mensajereos
        datosMemoria.getMensajeros().add(nuevo);
        System.out.println("Mensajero registrado con exito.");

        return ResponseEntity.ok("Mensajero creado exitosamente.");
    }

    // Actualizar Estado
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable String id, @RequestBody String nuevoEstado) {
        System.out.println("Cambiando estado de " + id + " a " + nuevoEstado);
        // no debe ser nulo
        Mensajero trabajador = null;
        List<Mensajero> lista = datosMemoria.getMensajeros();

            int _posicion_encontrada = -1;

            for (int i = 0; i < lista.size(); i++) {
                // Guardamos el ID en una variable local
                String _id_actual = lista.get(i).getId();

                if (_id_actual.equals(id)) {
                    _posicion_encontrada = i;
                    break; // Salimos al encontrar la coincidencia
                }
            }

            // Si la posicion cambio, obtenemos el objeto fuera del bucle
            if (_posicion_encontrada != -1) {
                trabajador = lista.get(_posicion_encontrada);
            }

        if (trabajador == null) {
            return ResponseEntity.notFound().build();
        }
        // nomas para limpair el formato en el que viene
        String estadoLimpio = nuevoEstado.replace("\"", "").trim();
        trabajador.setEstado(estadoLimpio);

        return ResponseEntity.ok("Estado actualizado.");
    }

    //  Mover de Centro pq su chamba ya termino en el centro entonces lo reasignamos
    @PutMapping("/{id}/centro")
    public ResponseEntity<?> reasignarCentro(@PathVariable String id, @RequestBody String nuevoCentroId) {
        // mansamos un succesful cuando se reasjuina un mensajero y marcamos tambien para tener un orden y constancia de donde y quien se reasgno
        System.out.println("Reasignando mensajero " + id + " al centro " + nuevoCentroId);

        Mensajero m = null;
        for (Mensajero temp : datosMemoria.getMensajeros()) {
            if (temp.getId().equals(id)) {
                m = temp;
                break;
            }
        }

        if (m == null) {
            return ResponseEntity.status(404).body("Mensajero no encontrado dentro de todo el sistema");
        }

        // Validacion de si esta ocupado no se mueve del lugar donde esta
        if (m.getEstado().equals("EN_TRANSITO")) {
            System.out.println("Fallo: El mensajero esta ocupado.");
            return ResponseEntity.badRequest().body("No se puede reasignar: El mensajero esta EN_TRANSITO.");
        }
        // igual esto nomas para limpiar como viene
        String idCentroLimpio = nuevoCentroId.replace("\"", "").trim();
        m.setCentro(idCentroLimpio);

        return ResponseEntity.ok("Mensajero traslado al centro " + idCentroLimpio);
    }
}