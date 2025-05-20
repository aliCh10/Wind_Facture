package com.example.services_ser.controller;

import com.example.services_ser.DTO.ServiceDTO;
import com.example.services_ser.Service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/services")
@Tag(name = "Services", description = "API pour la gestion des services pour le tenant authentifié")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAuthority('ROLE_PARTNER')")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @Operation(summary = "Créer un nouveau service pour le tenant authentifié")
    @PostMapping
    public ResponseEntity<ServiceDTO> createService(@Valid @RequestBody ServiceDTO serviceDTO) {
        ServiceDTO createdService = serviceService.createService(serviceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdService);
    }

    @Operation(summary = "Récupérer tous les services du tenant authentifié")
    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        List<ServiceDTO> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    @Operation(summary = "Récupérer un service par ID pour le tenant authentifié")
    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Long id) {
        return serviceService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Mettre à jour un service pour le tenant authentifié")
    @PutMapping("/{id}")
    public ResponseEntity<ServiceDTO> updateService(@PathVariable Long id, @Valid @RequestBody ServiceDTO serviceDTO) {
        return serviceService.updateService(id, serviceDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Supprimer un service pour le tenant authentifié")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        return serviceService.deleteService(id) 
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}