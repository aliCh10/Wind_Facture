package com.example.facture.Controllers;

import com.example.facture.DTO.CreateFactureRequest;
import com.example.facture.services.FactureService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/factures")
public class FactureController {

    private final FactureService factureService;

    public FactureController(FactureService factureService) {
        this.factureService = factureService;
    }

    @PostMapping(produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> createFacture(
            @Valid @RequestBody CreateFactureRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        // Extract JWT token from Authorization header
        String jwtToken = authorizationHeader.replace("Bearer ", "");

        // Call FactureService to create facture and generate PDF
        byte[] pdfBytes = factureService.createFacture(request, jwtToken);

        // Set response headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "facture_" + System.currentTimeMillis() + ".pdf");

        // Return PDF as response
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}