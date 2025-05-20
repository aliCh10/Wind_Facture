package com.example.facture.Controllers;

import com.example.facture.DTO.CreateModeleFactureRequest;
import com.example.facture.models.ModeleFacture;
import com.example.facture.services.ModeleFactureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/modele-facture")
public class ModeleFactureController {
    private final ModeleFactureService modeleFactureService;

    public ModeleFactureController(ModeleFactureService modeleFactureService) {
        this.modeleFactureService = modeleFactureService;
    }

    @PostMapping
    @Operation(summary = "Create a new invoice template", description = "Saves a new invoice template with sections and HTML content")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Template created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<ModeleFacture> createModeleFacture(@RequestBody CreateModeleFactureRequest request) {
        return ResponseEntity.ok(modeleFactureService.saveModeleFacture(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an invoice template by ID", description = "Retrieves an invoice template with its sections and content")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Template retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Template not found")
    })
    public ResponseEntity<ModeleFacture> getModeleFacture(@PathVariable Long id) {
        return modeleFactureService.getModeleFactureById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all invoice templates", description = "Retrieves all invoice templates ordered by creation date")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Templates retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No templates found")
    })
    public ResponseEntity<List<ModeleFacture>> getAllModeleFactures() {
        List<ModeleFacture> modeles = modeleFactureService.getAllModeleFactures();
        return modeles.isEmpty() 
                ? ResponseEntity.noContent().build() 
                : ResponseEntity.ok(modeles);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an invoice template", description = "Deletes an invoice template by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Template deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Template not found")
    })
    public ResponseEntity<Void> deleteModeleFacture(@PathVariable Long id) {
        return modeleFactureService.deleteModeleFacture(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Generate PDF for invoice template", description = "Generates and returns a PDF file for the specified invoice template")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "PDF generated successfully"),
            @ApiResponse(responseCode = "404", description = "Template not found")
    })
public ResponseEntity<byte[]> getModeleFacturePdf(@PathVariable Long id) {
    return modeleFactureService.getModeleFactureById(id)
            .map(model -> {
                byte[] pdfBytes = modeleFactureService.generateModeleFacturePdf(id, Collections.emptyMap());
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("inline", "invoice-template-" + id + ".pdf");
                return ResponseEntity.ok()
                        .headers(headers)
                        .body(pdfBytes);
            })
            .orElse(ResponseEntity.notFound().build());
}
 @GetMapping("/{id}/thumbnail")
    @Operation(summary = "Generate thumbnail for invoice template", description = "Generates and returns a PNG thumbnail of the first page of the invoice template")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Thumbnail generated successfully"),
            @ApiResponse(responseCode = "404", description = "Template not found"),
            @ApiResponse(responseCode = "500", description = "Error generating thumbnail")
    })
    public ResponseEntity<byte[]> getModeleThumbnail(@PathVariable Long id) {
        try {
            byte[] thumbnailBytes = modeleFactureService.generateModeleFactureThumbnail(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentDispositionFormData("inline", "thumbnail-" + id + ".png");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(thumbnailBytes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}