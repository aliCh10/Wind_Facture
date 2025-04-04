package com.example.employee_service.model;

import com.example.auth_service.model.Partner; 
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "employees")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Second name is required")
    private String secondName;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Job title is required")
    private String post;

    @NotBlank(message = "Department is required")
    private String department;

    private Long tenantId;

  private Long partnerId;

    @NotBlank(message = "Password is required")
    private String password; // Assurez-vous que ce champ est présent
}