// FactureController.java
package com.example.facture.Controllers;

import com.example.facture.DTO.CreateFactureRequest;
import com.example.facture.models.Facture;
import com.example.facture.models.ModeleFacture;
import com.example.facture.services.FactureService;
import com.example.facture.services.ModeleFactureService;
import com.example.facture.services.PdfGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/factures")
public class FactureController {

    private final FactureService factureService;
    private final PdfGenerationService pdfGenerationService;
    private final ModeleFactureService modeleFactureService;

    public FactureController(FactureService factureService, PdfGenerationService pdfGenerationService, ModeleFactureService modeleFactureService) {
        this.factureService = factureService;
        this.pdfGenerationService = pdfGenerationService;
        this.modeleFactureService = modeleFactureService;
    }

    @PostMapping
    public ResponseEntity<Facture> createFacture(@Valid @RequestBody CreateFactureRequest request) {
        Facture facture = factureService.createFacture(request);
        return ResponseEntity.ok(facture);
    }

    @PostMapping("/{id}/preview")
    public ResponseEntity<byte[]> generatePdfPreview(
            @PathVariable Long id,
            @RequestBody Map<String, String> clientData
    ) {
        ModeleFacture modele = modeleFactureService.getModeleFactureById(id)    
                .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " + id));

        byte[] pdfBytes = pdfGenerationService.generatePdfFromModele(modele, clientData);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "preview.pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}