package model;

// Importamos todo el paquete wilcard
import com.fasterxml.jackson.dataformat.xml.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.io.Serializable;

@JacksonXmlRootElement(localName = "logitrack")
public class ConfiguracionLogitrack implements Serializable {

    @JacksonXmlProperty(localName = "configuracion")
    private DatosConfig _data_config;


    public ConfiguracionLogitrack() {}

    public DatosConfig getConfiguracion() {
        return this._data_config;
    }

    public void setConfiguracion(DatosConfig d) {
        this._data_config = d;
    }


    public static class DatosConfig {

        @JacksonXmlElementWrapper(localName = "centros")
        @JacksonXmlProperty(localName = "centro")
        private List<Centro> _lista_centros;

        @JacksonXmlElementWrapper(localName = "rutas")
        @JacksonXmlProperty(localName = "ruta")
        private List<Ruta> _lista_rutas;

        @JacksonXmlElementWrapper(localName = "mensajeros")
        @JacksonXmlProperty(localName = "mensajero")
        private List<Mensajero> _lista_mensajeros;

        @JacksonXmlElementWrapper(localName = "paquetes")
        @JacksonXmlProperty(localName = "paquete")
        private List<Paquete> _lista_paquetes;

        @JacksonXmlElementWrapper(localName = "solicitudes")
        @JacksonXmlProperty(localName = "solicitud")
        private List<Solicitud> _lista_solicitudes;

        public DatosConfig() {
            this._lista_centros = new ArrayList<>();
            this._lista_rutas = new ArrayList<>();
            this._lista_mensajeros = new ArrayList<>();
            this._lista_paquetes = new ArrayList<>();
            this._lista_solicitudes = new ArrayList<>();
        }

        // GETTERS Y SETTERS

        public List<Centro> getListaCentros() {
            if (_lista_centros == null) return new ArrayList<>();
            return _lista_centros;
        }
        public void setListaCentros(List<Centro> l) {
            this._lista_centros = l;
        }

        public List<Ruta> getListaRutas() {
            if (_lista_rutas == null) return new ArrayList<>();
            return _lista_rutas;
        }
        public void setListaRutas(List<Ruta> l) {
            this._lista_rutas = l;
        }

        public List<Mensajero> getListaMensajeros() {
            if (_lista_mensajeros == null) return new ArrayList<>();
            return _lista_mensajeros;
        }
        public void setListaMensajeros(List<Mensajero> l) {
            this._lista_mensajeros = l;
        }

        public List<Paquete> getListaPaquetes() {
            if (_lista_paquetes == null) return new ArrayList<>();
            return _lista_paquetes;
        }
        public void setListaPaquetes(List<Paquete> l) {
            this._lista_paquetes = l;
        }

        public List<Solicitud> getListaSolicitudes() {
            if (_lista_solicitudes == null) return new ArrayList<>();
            return _lista_solicitudes;
        }
        public void setListaSolicitudes(List<Solicitud> l) {
            this._lista_solicitudes = l;
        }
    }
}