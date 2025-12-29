// Archivo: src/main/java/model/AsignacionManualDTO.java

package model;

public class AsignacionManualDTO {
    private String idPaquete;
    private String idMensajero;

    // Constructor vacío
    public AsignacionManualDTO() {}

    // Getters y Setters
    public String getIdPaquete() {
        return idPaquete;
    }
    public void setIdPaquete(String idPaquete) {
        this.idPaquete = idPaquete;
    }
    public String getIdMensajero() {
        return idMensajero;
    }
    public void setIdMensajero(String idMensajero) {
        this.idMensajero = idMensajero;
    }
}