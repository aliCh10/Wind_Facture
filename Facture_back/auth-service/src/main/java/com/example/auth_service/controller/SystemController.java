package com.example.auth_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth_service.model.Partner;
import com.example.auth_service.service.SystemService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/public/system")
@PreAuthorize("hasAuthority('ROLE_SYSTEME')")
public class SystemController {

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }


    @Operation(summary = "Get all partners with 'PARTNER' role", description = "This endpoint returns all partners who have the 'PARTNER' role.")
    @GetMapping("/partners")
    public ResponseEntity<List<Partner>> getAllPartners() {
        List<Partner> partners = systemService.getPartnersByRole();  
        return ResponseEntity.ok(partners);
    }

    @Operation(summary = "Validate partner by ID", description = "This endpoint allows validating a partner by their ID.")
    @PostMapping("/validate-partner/{id}")
    public ResponseEntity<?> validatePartner(
        @PathVariable @Schema(description = "ID of the partner to be validated", required = true) Integer id
    ) {
        String response = systemService.validatePartner(id);  
        return ResponseEntity.ok().body("{\"message\": \"" + response + "\"}");
    }
    @DeleteMapping("/delete-partner/{id}")
    public ResponseEntity<?> deletePartner(
        @PathVariable @Schema(description = "ID of the partner to be deleted", required = true) Integer id
    ) {
       
        String response = systemService.deletePartner(id);  
                return ResponseEntity.ok().body("{\"message\": \"" + response + "\"}");
    }
    
}
