package com.example.services_ser.controller;

import com.example.services_ser.Service.ServiceService;
import com.example.services_ser.model.Service;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import java.util.List;
@RestController
@RequestMapping("/services")
@Tag(name = "Services", description = "API pour la gestion des services")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAuthority('ROLE_PARTNER')")
@AllArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

  

    // CREATE
    @PostMapping
    public ResponseEntity<Service> createService(@Valid @RequestBody Service service) {
        Service createdService = serviceService.createService(service);
        return new ResponseEntity<>(createdService, HttpStatus.CREATED);
    }

    // READ (tous les services)
    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceService.getAllServices();
        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    // READ (un service par ID)
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        Service service = serviceService.getServiceById(id)
            .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        return new ResponseEntity<>(service, HttpStatus.OK);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @Valid @RequestBody Service serviceDetails) {
        Service updatedService = serviceService.updateService(id, serviceDetails);
        return new ResponseEntity<>(updatedService, HttpStatus.OK);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Gestion des exceptions (optionnel mais recommandé)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }
}