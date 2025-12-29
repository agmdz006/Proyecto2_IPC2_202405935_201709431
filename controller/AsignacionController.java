
package controller;

import model.AsignacionManualDTO;
import model.Paquete;
import service.AsignacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/envios") //
public class AsignacionController {

    private final AsignacionService asignacionService;

    public AsignacionController(AsignacionService asignacionService) {
        this.asignacionService = asignacionService;
    }

    // El tipo de retorno debe ser genérico para manejar Paquete (éxito) o String (error)
    @PutMapping("/asignar")
    public ResponseEntity<?> asignarManualmente(@RequestBody AsignacionManualDTO dto) {
        try {
            Paquete paqueteAsignado = asignacionService.asignarPaquete(dto);
            return ResponseEntity.ok(paqueteAsignado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

