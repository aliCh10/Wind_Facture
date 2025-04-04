package com.example.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Second name is required")
    private String secondName;

    @NotBlank(message = "tel is required")
    private String tel;

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    private String email;



    @NotBlank(message = "Job title is required")
    private String post;

    @NotBlank(message = "Department is required")
    private String department;
}