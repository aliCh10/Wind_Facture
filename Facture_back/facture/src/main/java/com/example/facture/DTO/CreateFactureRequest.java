// com.example.facture.DTO.CreateFactureRequest
package com.example.facture.DTO;

import java.time.LocalDate;
import java.util.List;

public class CreateFactureRequest {
    private Long templateId;
    private Long clientId;
    private String clientName;
    private String clientPhone; // Add clientPhone
    private String clientAddress; // Add clientAddress
    private String clientRIB; // Add clientRIB
    private List<ServiceRequest> services;
    private LocalDate creationDate;
    private LocalDate dueDate;
    private String footerText;

    // Getters and Setters
    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    public String getClientAddress() {
        return clientAddress;
    }

    public void setClientAddress(String clientAddress) {
        this.clientAddress = clientAddress;
    }

    public String getClientRIB() {
        return clientRIB;
    }

    public void setClientRIB(String clientRIB) {
        this.clientRIB = clientRIB;
    }

    public List<ServiceRequest> getServices() {
        return services;
    }

    public void setServices(List<ServiceRequest> services) {
        this.services = services;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDate creationDate) {
        this.creationDate = creationDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getFooterText() {
        return footerText;
    }

    public void setFooterText(String footerText) {
        this.footerText = footerText;
    }
}