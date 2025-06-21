package com.example.services_ser.controller;

import com.example.services_ser.DTO.ServiceDTO;
import com.example.services_ser.Service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

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
    public ResponseEntity<?> createService(@Valid @RequestBody ServiceDTO serviceDTO) {
        try {
            ServiceDTO createdService = serviceService.createService(serviceDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdService);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @Operation(summary = "Récupérer tous les services du tenant authentifié avec pagination")
    @GetMapping
    public ResponseEntity<Page<ServiceDTO>> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(serviceService.getAllServices(pageable));
    }

    @Operation(summary = "Récupérer un service par ID pour le tenant authentifié")
    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Long id) {
        return serviceService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
    }

    @Operation(summary = "Mettre à jour un service pour le tenant authentifié")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @Valid @RequestBody ServiceDTO serviceDTO) {
        try {
            ServiceDTO updatedService = serviceService.updateService(id, serviceDTO);
            return ResponseEntity.ok(updatedService);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @Operation(summary = "Supprimer un service pour le tenant authentifié")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        try {
            serviceService.deleteService(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @Operation(summary = "Recherche avancée des services avec pagination")
    @PostMapping("/search")
    public ResponseEntity<Page<ServiceDTO>> searchServices(
            @Valid @RequestBody ServiceDTO serviceDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(serviceService.searchServices(serviceDTO, pageable));
    }

    @Operation(summary = "Rechercher des services par nom pour le tenant authentifié avec pagination")
    @GetMapping("/search-by-name")
    public ResponseEntity<Page<ServiceDTO>> searchServicesByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(serviceService.searchServicesByName(name, pageable));
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}