package com.example.employee_service.controller;

import com.example.auth_service.config.JwtService;
import com.example.employee_service.dto.EmployeeDTO;
import com.example.employee_service.service.EmployeeService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<?> addEmployee(
            @RequestHeader("Authorization") String token, 
            @RequestBody EmployeeDTO request) {

        // Vérifier et extraire le tenantId
        String jwt = token.substring(7); // Enlever "Bearer "
        Long tenantId = jwtService.extractTenantId(jwt);

        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid token"));
        }

        return employeeService.addEmployee(tenantId, request);
    }
}
