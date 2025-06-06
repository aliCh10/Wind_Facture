package com.example.facture.Controllers;
import com.example.facture.DTO.CreateFactureRequest;
import com.example.facture.models.Facture;
import com.example.facture.models.ModeleFacture;
import com.example.facture.security.JwtAuthentication;
import com.example.facture.services.FactureService;
import com.example.facture.services.ModeleFactureService;
import com.example.facture.services.PdfGenerationService;


import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor

@RequestMapping("/api/factures")
public class FactureController {

    private final FactureService factureService;
     private final PdfGenerationService pdfGenerationService;
    private final ModeleFactureService modeleFactureService;

 

    @PostMapping
    public ResponseEntity<Facture> createFacture(@RequestBody CreateFactureRequest request) {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            return ResponseEntity.status(401).build();
        }
        Long tenantId = authentication.getTenantId();
        Facture facture = factureService.createFacture(request, tenantId);
        return ResponseEntity.ok(facture);
    }

    @GetMapping
    public ResponseEntity<List<Facture>> getFactures() {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            return ResponseEntity.status(401).build();
        }
        Long tenantId = authentication.getTenantId();
        List<Facture> factures = factureService.getFacturesByTenantId(tenantId);
        return ResponseEntity.ok(factures);
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