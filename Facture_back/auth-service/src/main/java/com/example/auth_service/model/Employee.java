package com.example.auth_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "employees")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@DiscriminatorValue("EMPLOYEE")  
public class Employee extends User {

    @NotBlank(message = "Job title is required")
    private String post;

    @NotBlank(message = "Department is required")
    private String department;

    public Employee(String name, String secondName, String email, String password, Role role,
                    String jobTitle, String department) {
        super(name, secondName, email, password, role);
        this.post = jobTitle;
        this.department = department;
    }
}
