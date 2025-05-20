package com.example.facture.DTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

public class CreateFactureRequest {
    @NotNull(message = "ModeleFacture ID is required")
    private Long modeleFactureId;

    private Long clientId; // Optional: ID of existing client
    private Map<String, String> newClient; // Optional: Data to create new client

    @NotEmpty(message = "At least one service is required")
    private List<Long> serviceIds; // IDs of existing services
    private List<Map<String, Object>> newServices; // Optional: Data to create new services

    // Getters and Setters
    public Long getModeleFactureId() {
        return modeleFactureId;
    }

    public void setModeleFactureId(Long modeleFactureId) {
        this.modeleFactureId = modeleFactureId;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Map<String, String> getNewClient() {
        return newClient;
    }

    public void setNewClient(Map<String, String> newClient) {
        this.newClient = newClient;
    }

    public List<Long> getServiceIds() {
        return serviceIds;
    }

    public void setServiceIds(List<Long> serviceIds) {
        this.serviceIds = serviceIds;
    }

    public List<Map<String, Object>> getNewServices() {
        return newServices;
    }

    public void setNewServices(List<Map<String, Object>> newServices) {
        this.newServices = newServices;
    }
}