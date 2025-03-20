package com.example.auth_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "partners")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@DiscriminatorValue("PARTNER")
public class Partner extends User {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Company type is required")
    private String companyType;

    private String website;
    private String businessLicense;
    private String crn;
    private String logoUrl;



    // Constructeur spécifique
    public Partner(String name, String secondName, String email, String password, Role role,
                   String companyName, String address, String companyType) {
        super(name, secondName, email, password, role);
        this.companyName = companyName;
        this.address = address;
        this.companyType = companyType;
    }
}
