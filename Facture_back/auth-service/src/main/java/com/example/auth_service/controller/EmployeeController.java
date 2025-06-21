package com.example.auth_service.controller;

import com.example.auth_service.dto.EmployeeRegisterRequest;
import com.example.auth_service.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/employees")
@Tag(name = "Employees", description = "API pour la gestion des employés")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAuthority('ROLE_PARTNER')")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @Operation(summary = "Ajouter un nouvel employé pour le tenant authentifié")
    @PostMapping("/{partnerId}")
    public ResponseEntity<?> addEmployee(@PathVariable Long partnerId, 
                                        @Valid @RequestBody EmployeeRegisterRequest request,
                                        HttpServletRequest httpRequest) {
        return employeeService.addEmployee(partnerId, request, httpRequest);
    }

    @Operation(summary = "Récupérer un employé par ID pour le tenant authentifié")
    @GetMapping("/{employeeId}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long employeeId, 
                                            HttpServletRequest httpRequest) {
        return employeeService.getEmployeeById(employeeId, httpRequest);
    }

    @Operation(summary = "Récupérer tous les employés du tenant authentifié avec pagination")
    @GetMapping
    public ResponseEntity<?> getAllEmployees(HttpServletRequest httpRequest,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return employeeService.getAllEmployees(httpRequest, pageable);
    }

    @Operation(summary = "Mettre à jour un employé pour le tenant authentifié")
    @PutMapping("/{employeeId}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long employeeId, 
                                           @Valid @RequestBody EmployeeRegisterRequest request,
                                           HttpServletRequest httpRequest) {
        return employeeService.updateEmployee(employeeId, request, httpRequest);
    }

    @Operation(summary = "Supprimer un employé pour le tenant authentifié")
    @DeleteMapping("/{employeeId}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long employeeId, 
                                           HttpServletRequest httpRequest) {
        return employeeService.deleteEmployee(employeeId, httpRequest);
    }

    @Operation(summary = "Changer le mot de passe d’un employé pour le tenant authentifié")
    @PutMapping("/{employeeId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long employeeId, 
                                           @RequestParam String newPassword,
                                           HttpServletRequest httpRequest) {
        return employeeService.changePassword(employeeId, newPassword, httpRequest);
    }

    @Operation(summary = "Rechercher des employés par nom pour le tenant authentifié avec pagination")
    @PostMapping("/search")
    public ResponseEntity<?> searchEmployeesByName(@RequestParam String name, 
                                                  HttpServletRequest httpRequest,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return employeeService.searchEmployeesByName(name, httpRequest, pageable);
    }
}