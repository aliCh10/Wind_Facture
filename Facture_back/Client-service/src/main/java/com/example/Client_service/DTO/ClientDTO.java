package com.example.Client_service.DTO;

import jakarta.validation.constraints.NotBlank;

public class ClientDTO {
    private Long id;

    @NotBlank(message = "Client name is required")
    private String clientName;

    @NotBlank(message = "Client phone is required")
    private String clientPhone;

    @NotBlank(message = "Client address is required")
    private String clientAddress;

    @NotBlank(message = "RIB is required")
    private String rib;

    // Getter et Setter pour id
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getter et Setter pour clientName
    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    // Getter et Setter pour clientPhone
    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    // Getter et Setter pour clientAddress
    public String getClientAddress() {
        return clientAddress;
    }

    public void setClientAddress(String clientAddress) {
        this.clientAddress = clientAddress;
    }

    // Getter et Setter pour rib
    public String getRib() {
        return rib;
    }

    public void setRib(String rib) {
        this.rib = rib;
    }
}