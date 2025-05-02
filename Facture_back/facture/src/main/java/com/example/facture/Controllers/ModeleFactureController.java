package com.example.facture.Controllers;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.facture.DTO.CreateModeleFactureRequest;
import com.example.facture.models.ModeleFacture;
import com.example.facture.services.ModeleFactureService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/modele-facture")
public class ModeleFactureController {

    @Autowired
    private ModeleFactureService modeleFactureService;

    @PostMapping
    @Operation(summary = "Create a new invoice template", description = "Saves a new invoice template with sections")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Template created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<ModeleFacture> createModeleFacture(
            @RequestBody CreateModeleFactureRequest request) {
        ModeleFacture savedModel = modeleFactureService.saveModeleFacture(
                request.getName(), request.getSections());
        return ResponseEntity.ok(savedModel);
    }
    @GetMapping("/{id}")
    @Operation(summary = "Get an invoice template by ID", description = "Retrieves an invoice template with its sections")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Template retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Template not found")
    })
    public ResponseEntity<ModeleFacture> getModeleFacture(@PathVariable Long id) {
        Optional<ModeleFacture> modeleFacture = modeleFactureService.getModeleFactureById(id);
        return modeleFacture.map(ResponseEntity::ok)
                           .orElseGet(() -> ResponseEntity.notFound().build());
    }
    // ModeleFactureController.java
@GetMapping
@Operation(summary = "Get all invoice templates", description = "Retrieves all invoice templates ordered by creation date")
@ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Templates retrieved successfully"),
    @ApiResponse(responseCode = "204", description = "No templates found")
})
public ResponseEntity<List<ModeleFacture>> getAllModeleFactures() {
    List<ModeleFacture> modeles = modeleFactureService.getAllModeleFactures();
    if (modeles.isEmpty()) {
        return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(modeles);
}
}