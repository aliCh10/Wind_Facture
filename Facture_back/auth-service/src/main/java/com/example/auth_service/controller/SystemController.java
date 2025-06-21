package com.example.auth_service.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth_service.model.Partner;
import com.example.auth_service.service.SystemService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/system")
@PreAuthorize("hasAuthority('ROLE_System')")
public class SystemController {

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    @Operation(summary = "Get all partners with 'PARTNER' role", description = "Returns a paginated list of partners with 'PARTNER' role, optionally filtered by name.")
    @GetMapping("/partners")
    public ResponseEntity<Page<Partner>> getAllPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "name,asc") String sort,
            @RequestParam(required = false) String name) {
        String[] sortParams = sort.split(",");
        Sort sorting = Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sorting);
        Page<Partner> partners = systemService.getPartnersByRole(name, pageable);
        return ResponseEntity.ok(partners);
    }

    @Operation(summary = "Validate partner by ID", description = "This endpoint allows validating a partner by their ID.")
    @PostMapping("/validate-partner/{id}")
    public ResponseEntity<?> validatePartner(
            @PathVariable @Schema(description = "ID of the partner to be validated", required = true) Integer id) {
        String response = systemService.validatePartner(id);
        return ResponseEntity.ok().body("{\"message\": \"" + response + "\"}");
    }

    @Operation(summary = "Delete partner by ID", description = "This endpoint allows deleting a partner by their ID.")
    @DeleteMapping("/delete-partner/{id}")
    public ResponseEntity<?> deletePartner(
            @PathVariable @Schema(description = "ID of the partner to be deleted", required = true) Integer id) {
        String response = systemService.deletePartner(id);
        return ResponseEntity.ok().body("{\"message\": \"" + response + "\"}");
    }
}