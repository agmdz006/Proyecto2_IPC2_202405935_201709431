package controller;

import service.CargaService;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ImportarController {

    @Autowired
    private CargaService servicioDeCarga;
// este endpoitn l ousarar cuando importelos un archivo tiene que ser fijo fijo xml
    @PostMapping("/importar")
    public ResponseEntity<String> subirArchivo(@RequestParam("file") MultipartFile archivo) {
        // aqui validamos si no viene bacio el xml que subio
        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: El archivo viene vacio.");
        }
        String resultado = servicioDeCarga.procesarArchivo(archivo);

        if (resultado.startsWith("Error")) {
            //  solo marcamos un error si no biente tipos de xml
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}