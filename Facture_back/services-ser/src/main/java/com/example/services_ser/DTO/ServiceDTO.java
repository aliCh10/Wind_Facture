package com.example.services_ser.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServiceDTO {
    private Long id;

    @NotBlank(message = "Reference cannot be empty")
    private String ref;

    @NotBlank(message = "Service name cannot be empty")
    private String serviceName;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal servicePrice;
}