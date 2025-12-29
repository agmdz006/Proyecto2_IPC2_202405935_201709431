package model;
// Importamos todo el paquete wilcard
import com.fasterxml.jackson.dataformat.xml.annotation.*;

public class Centro {

    // atributos del xml
    @JacksonXmlProperty(isAttribute = true)
    private String id;

    @JacksonXmlProperty(localName = "nombre")
    private String nombre;

    @JacksonXmlProperty(localName = "ciudad")
    private String ciudad;

    @JacksonXmlProperty(localName = "capacidad")
    private int capacidad;

    private int paquetesActuales;

    public Centro() {
        this.paquetesActuales = 0;
    }

    // getters y setters
    public String getId() {

        return id;
    }

    public void setId(String id) {

        this.id = id;
    }

    public String getNombre() {

        return nombre;
    }

    public void setNombre(String nombre) {

        this.nombre = nombre;
    }

    public String getCiudad() {

        return ciudad;
    }

    public void setCiudad(String ciudad) {

        this.ciudad = ciudad;
    }

    public int getCapacidad() {

        return capacidad;
    }

    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }

    public int getPaquetesActuales() {
        return paquetesActuales;
    }

    public void setPaquetesActuales(int paquetesActuales) {
        this.paquetesActuales = paquetesActuales;
    }
}