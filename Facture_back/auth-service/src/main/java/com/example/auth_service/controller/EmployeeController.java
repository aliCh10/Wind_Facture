package com.example.auth_service.controller;

import com.example.auth_service.dto.EmployeeRegisterRequest;
import com.example.auth_service.service.EmployeeService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employee")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAuthority('ROLE_PARTNER')")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping("/employee/{partnerId}")
    public ResponseEntity<?> addEmployee(@PathVariable Long partnerId, 
                                          @RequestBody EmployeeRegisterRequest request) {
        return employeeService.addEmployee(partnerId, request);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long employeeId) {
        return employeeService.getEmployeeById(employeeId);
    }
    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @PutMapping("/employee/{employeeId}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long employeeId, 
                                            @RequestBody EmployeeRegisterRequest request) {
        return employeeService.updateEmployee(employeeId, request);
    }

    @DeleteMapping("/employee/{employeeId}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long employeeId) {
        return employeeService.deleteEmployee(employeeId);
    }
    @PutMapping("/employee/{employeeId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long employeeId, 
                                            @RequestParam String newPassword) {
        return employeeService.changePassword(employeeId, newPassword);
    }
}
