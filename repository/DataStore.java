package repository;

import model.*;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataStore {

    // bariables de almacenamiento en memoria

    private List<Centro> listaDeCentros;
    private List<Ruta> listaDeRutas;
    private List<Mensajero> listaDeMensajeros;

    // constructor
    public DataStore() {
        System.out.println("Inicializando DataStore...");
        this.listaDeCentros = new ArrayList<>();
        this.listaDeRutas = new ArrayList<>();
        this.listaDeMensajeros = new ArrayList<>();
        this.listaDePaquetes = new ArrayList<>();
        this.listaDeSolicitudes = new ArrayList<>();
    }

    private List<Paquete> listaDePaquetes;
    private List<Solicitud> listaDeSolicitudes;

    public void limpiarTodo() {

        if(this.listaDeCentros != null) this.listaDeCentros.clear();
        if(this.listaDeRutas != null) this.listaDeRutas.clear();
        if(this.listaDeMensajeros != null) this.listaDeMensajeros.clear();
        if(this.listaDePaquetes != null) this.listaDePaquetes.clear();
        if(this.listaDeSolicitudes != null) this.listaDeSolicitudes.clear();
    }

    // Acceso a los Getters

    public List<Centro> getCentros() {
        if(listaDeCentros == null) {
            return new ArrayList<>();
        }
        return listaDeCentros;
    }

    public List<Mensajero> getMensajeros() {
        return listaDeMensajeros;
    }

    public void imprimirEstadisticas() {
        System.out.println("Centros cargados: " + listaDeCentros.size());
        System.out.println("Rutas cargadas: " + listaDeRutas.size());
    }

    public List<Ruta> getRutas() {
        return listaDeRutas;
    }

    public List<Paquete> getPaquetes() {
        return listaDePaquetes;
    }

    public List<Solicitud> getSolicitudes() {
        return listaDeSolicitudes;
    }
}