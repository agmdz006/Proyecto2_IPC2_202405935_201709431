package controller;

import service.DespachoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DespachoController {

    @Autowired
    private DespachoService servicio;

    @PostMapping("/procesar")
    // este  endpoint lo usaras para procesar cuand se procese una soli
    public ResponseEntity<String> procesarSolicitudes() {
        // recordar mandar a llamar el procesar desapacho de service
        String resultado_Procesado = servicio.procesarDespacho();

        return ResponseEntity.ok(resultado_Procesado);
    }
}