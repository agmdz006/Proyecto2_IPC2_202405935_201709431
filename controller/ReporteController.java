package controller;

import service.ReporteService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.*;


@RestController
@RequestMapping("/api/reporte")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    // Este endpoint devuelve el XML final esto te va ayudar para que lo mande a llamar este endpoint y te descargue el xml salida con el forma requerido
    @GetMapping(produces = "application/xml")
    public ResponseEntity<String> obtenerReporteFinal() {

        String xmlSalida = reporteService.generarXmlSalida();

        return ResponseEntity.ok(xmlSalida);
    }
}