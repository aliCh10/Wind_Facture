package com.example.facture.Controllers;
import com.example.facture.DTO.CreateFactureRequest;
import com.example.facture.models.Facture;
import com.example.facture.models.ModeleFacture;
import com.example.facture.security.JwtAuthentication;
import com.example.facture.services.FactureService;
import com.example.facture.services.ModeleFactureService;
import com.example.facture.services.PdfGenerationService;


import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<Map<String, Object>> getFactures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long tenantId = authentication.getTenantId();
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Facture> facturePage = factureService.getFacturesByTenantId(tenantId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", facturePage.getContent());
        response.put("currentPage", facturePage.getNumber());
        response.put("totalItems", facturePage.getTotalElements());
        response.put("totalPages", facturePage.getTotalPages());
        response.put("pageSize", facturePage.getSize());

        return ResponseEntity.ok(response);
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
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacture(@PathVariable Long id) {
        try {
            factureService.deleteFacture(id);
            return ResponseEntity.noContent().build(); 
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null); // 404 Not Found
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null); // 500 Internal Server Error
        }
    }
 @PutMapping("/{id}/modele")
    public ResponseEntity<Facture> updateFactureModele(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            return ResponseEntity.status(401).build();
        }
        Long tenantId = authentication.getTenantId();
        Long templateId = request.get("templateId");
        if (templateId == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Facture updatedFacture = factureService.updateFactureModele(id, templateId, tenantId);
            return ResponseEntity.ok(updatedFacture);
        } catch (RuntimeException e) {  
            return ResponseEntity.status(404).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    @GetMapping("/stats/revenue-by-period")
public ResponseEntity<Map<String, Double>> getRevenueByPeriod(
        @RequestParam String periodType,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getTenantId() == null) {
        return ResponseEntity.status(401).build();
    }
    Long tenantId = authentication.getTenantId();
    try {
        Map<String, Double> revenue = factureService.getRevenueByPeriod(tenantId, periodType, startDate, endDate);
        return ResponseEntity.ok(revenue);
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}
@GetMapping("/stats/top-clients")
public ResponseEntity<List<Map<String, Object>>> getTopClientsByRevenue(@RequestParam(defaultValue = "5") int limit) {
    JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getTenantId() == null) {
        return ResponseEntity.status(401).build();
    }
    Long tenantId = authentication.getTenantId();
    try {
        List<Map<String, Object>> topClients = factureService.getTopClientsByRevenue(tenantId, limit);
        return ResponseEntity.ok(topClients);
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}
@GetMapping("/stats/top-services")
public ResponseEntity<List<Map<String, Object>>> getTopServicesByRevenue(@RequestParam(defaultValue = "5") int limit) {
    JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getTenantId() == null) {
        return ResponseEntity.status(401).build();
    }
    Long tenantId = authentication.getTenantId();
    try {
        List<Map<String, Object>> topServices = factureService.getTopServicesByRevenue(tenantId, limit);
        return ResponseEntity.ok(topServices);
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}
@GetMapping("/stats/top-modeles")
    public ResponseEntity<List<Map<String, Object>>> getTopModelesByUsage(@RequestParam(defaultValue = "5") int limit) {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long tenantId = authentication.getTenantId();
        try {
            List<Map<String, Object>> topModeles = factureService.getTopModelesByUsage(tenantId, limit);
            return ResponseEntity.ok(topModeles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}