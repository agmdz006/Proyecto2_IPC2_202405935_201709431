

package controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import model.Paquete;
import service.EntregaService;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/entregas") // Mapeo base: /api/entregas
public class EntregaController {

    private final EntregaService entregaService;

    public EntregaController(EntregaService entregaService) {
        this.entregaService = entregaService;
    }

    /**
     * PUT /api/entregas/finalizar
     * Recibe el ID del paquete y finaliza su entrega.
     */
    @PutMapping("/finalizar") // Mapea a PUT /api/entregas/finalizar
    public ResponseEntity<?> finalizarEntrega(@RequestBody Map<String, String> payload) {
        String idPaquete = payload.get("idPaquete");

        if (idPaquete == null || idPaquete.isEmpty()) {
            return ResponseEntity.badRequest().body("Debe proporcionar el ID del paquete para finalizar la entrega.");
        }

        try {
            Paquete paqueteFinalizado = entregaService.finalizarEntrega(idPaquete);
            return ResponseEntity.ok(paqueteFinalizado);
        } catch (NoSuchElementException | IllegalStateException e) {
            // Devuelve un error 400 con el mensaje de error específico
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            // Para cualquier otro error inesperado
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno del servidor al finalizar la entrega: " + e.getMessage());
        }
    }
}