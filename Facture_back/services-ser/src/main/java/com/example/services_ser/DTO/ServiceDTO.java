package com.example.services_ser.DTO;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class ServiceDTO {

    private Long id; // Ensure id is included
    @NotBlank(message = "Reference cannot be empty")
    private String ref;

    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer serviceQuantity;

    @NotBlank(message = "Service name cannot be empty")
    private String serviceName;

    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal servicePrice;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public String getRef() {
        return ref;
    }

    public void setRef(String ref) {
        this.ref = ref;
    }

    public Integer getServiceQuantity() {
        return serviceQuantity;
    }

    public void setServiceQuantity(Integer serviceQuantity) {
        this.serviceQuantity = serviceQuantity;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public BigDecimal getServicePrice() {
        return servicePrice;
    }

    public void setServicePrice(BigDecimal servicePrice) {
        this.servicePrice = servicePrice;
    }
}