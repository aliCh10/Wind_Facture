package com.example.services_ser.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Reference cannot be empty")
    private String ref;

    @Column(nullable = false)
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer serviceQuantity;

    @Column(nullable = false)
    @NotBlank(message = "Service name cannot be empty")
    private String serviceName;

    @Column(nullable = false)
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal servicePrice;
}