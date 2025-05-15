package com.example.services_ser.controller;

import com.example.services_ser.DTO.ServiceDTO;
import com.example.services_ser.Service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@Tag(name = "Services", description = "API for managing services for the authenticated tenant")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAuthority('ROLE_PARTNER')")
@AllArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    // CREATE
    @Operation(summary = "Create a new service for the authenticated tenant")
    @PostMapping
    public ResponseEntity<ServiceDTO> createService(@Valid @RequestBody ServiceDTO serviceDTO) {
        ServiceDTO createdService = serviceService.createService(serviceDTO);
        return new ResponseEntity<>(createdService, HttpStatus.CREATED);
    }

    // READ (all services)
    @Operation(summary = "Retrieve all services for the authenticated tenant")
    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        List<ServiceDTO> services = serviceService.getAllServices();
        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    // READ (single service by ID)
    @Operation(summary = "Retrieve a service by ID for the authenticated tenant")
    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Long id) {
        ServiceDTO serviceDTO = serviceService.getServiceById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        return new ResponseEntity<>(serviceDTO, HttpStatus.OK);
    }

    // UPDATE
    @Operation(summary = "Update a service for the authenticated tenant")
    @PutMapping("/{id}")
    public ResponseEntity<ServiceDTO> updateService(@PathVariable Long id, @Valid @RequestBody ServiceDTO serviceDTO) {
        ServiceDTO updatedService = serviceService.updateService(id, serviceDTO);
        return new ResponseEntity<>(updatedService, HttpStatus.OK);
    }

    // DELETE
    @Operation(summary = "Delete a service for the authenticated tenant")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Exception handling
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }
}