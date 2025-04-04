package com.example.employee_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {
    private String name;
    private String secondName;
    private String email;
    private String post;
    private String department;
}
