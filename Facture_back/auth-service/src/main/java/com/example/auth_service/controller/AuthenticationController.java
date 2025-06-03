package com.example.auth_service.controller;

import com.example.auth_service.Repository.EmployeeRepository;
import com.example.auth_service.Repository.PartnerRepository;
import com.example.auth_service.config.JwtService;
import com.example.auth_service.dto.AuthentificationRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UpdateProfileEmployee;
import com.example.auth_service.dto.UpdateProfilePartner;
import com.example.auth_service.model.Employee;
import com.example.auth_service.model.Partner;
import com.example.auth_service.model.Role;
import com.example.auth_service.service.AuthenticationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("public")
@RequiredArgsConstructor
@Slf4j

public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final UserDetailsService userDetailsService; 
    private final JwtService jwtService; 
        private final PartnerRepository partnerRepository;
        private final EmployeeRepository employeeRepository;

  @PostMapping(value = "/register", consumes = {"multipart/form-data"})
public ResponseEntity<?> register(@ModelAttribute RegisterRequest request, 
                                  @RequestParam("logo") MultipartFile file) {
                                    log.info("📌 Requête d'inscription reçue pour : {}", request.getEmail());
    return authenticationService.register(request, file);
}


    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestParam String email, @RequestParam String code) {
        return authenticationService.verifyCode(email, code);
    }

@PostMapping("/login")
public ResponseEntity<?> authenticate(@RequestBody AuthentificationRequest authentificationRequest) {
    return authenticationService.authenticate(authentificationRequest.getEmail(), authentificationRequest.getPassword());
}

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        return authenticationService.forgotPassword(email);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, 
                                           @RequestParam String code, 
                                           @RequestParam String newPassword) {
        return authenticationService.resetPassword(email, code, newPassword);
    }
 
   @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        try {
            String email = jwtService.extractUsername(token);
            Long tenantId = jwtService.extractTenantId(token);
            List<String> roles = jwtService.extractRoles(token);   
                     UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (jwtService.isTokenValid(token, userDetails)) {
                if (userDetails.getAuthorities().stream()
                        .anyMatch(grantedAuthority ->
                         grantedAuthority.getAuthority().equals("ROLE_PARTNER") ||
                          grantedAuthority.getAuthority().equals("ROLE_EMPLOYE"))) {
                    // Return a JSON object without DTO
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Token is valid");
                    response.put("tenantId", tenantId);
                    response.put("roles", roles);
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(403).body("User does not have the required role");
                }
            } else {
                return ResponseEntity.status(401).body("Invalid or expired token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token validation failed: " + e.getMessage());
        }
    }
    @GetMapping("/company-info")
public ResponseEntity<Map<String, String>> getCompanyInfo(@RequestHeader("Authorization") String token) {
    String email = jwtService.extractUsername(token.replace("Bearer ", ""));
    Partner partner = partnerRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Partner not found"));
    
    Map<String, String> response = new HashMap<>();
    response.put("companyName", partner.getCompanyName());
    response.put("address", partner.getAddress());
    response.put("tel", partner.getTel());
    response.put("email", partner.getEmail());
    response.put("companyType", partner.getCompanyType());
    response.put("logoUrl", partner.getLogoUrl());
    response.put("website", partner.getWebsite());
    response.put("businessLicense", partner.getBusinessLicense());
    response.put("crn", partner.getCrn());
    
    return ResponseEntity.ok(response);
}
  @Operation(summary = "Update Partner Profile", description = "Updates the profile of a partner, including optional logo upload")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Partner profile updated successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "403", description = "Unauthorized: Partner does not belong to your tenant"),
        @ApiResponse(responseCode = "404", description = "Partner not found"),
        // @ApiResponse(responseCode = "400", description = "Invalid input or email already in use")
    })
   @PutMapping(value = "/partner/{partnerId}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasAuthority('ROLE_PARTNER')")
public ResponseEntity<?> updatePartnerProfile(
        @PathVariable Long partnerId,
        @ModelAttribute UpdateProfilePartner request,   
        @RequestPart(value = "logo", required = false) @Schema(type = "string", format = "binary", description = "Logo image file") MultipartFile file,
        HttpServletRequest httpRequest) {
    Long authenticatedTenantId = jwtService.extractTenantId(httpRequest.getHeader("Authorization").substring(7));
    Partner partner = partnerRepository.findById(partnerId)
            .orElseThrow(() -> new RuntimeException("Partner not found"));

    log.info("Authenticated Tenant ID: {}", authenticatedTenantId);
    log.info("Partner Tenant ID: {}", partner.getTenantId());

    if (!partner.getTenantId().equals(authenticatedTenantId)) {
        log.error("Tenant ID mismatch: authenticatedTenantId={}, partnerTenantId={}", 
                  authenticatedTenantId, partner.getTenantId());
        return ResponseEntity.status(403).body(Map.of("message", "Unauthorized: Partner does not belong to your tenant"));
    }

    return authenticationService.updatePartnerProfile(partnerId, request, file);
}

    @PutMapping("/employee/{employeeId}/profile")
    @PreAuthorize("hasAnyAuthority('ROLE_PARTNER', 'ROLE_EMPLOYE')")
    public ResponseEntity<?> updateEmployeeProfile(
            @PathVariable Long employeeId,
            @RequestBody UpdateProfileEmployee request,
            HttpServletRequest httpRequest) {
        Long authenticatedTenantId = jwtService.extractTenantId(httpRequest.getHeader("Authorization").substring(7));
        Employee employee = (Employee) employeeRepository.findById(employeeId)
                .filter(user -> user.getRole() == Role.EMPLOYE)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        if (!employee.getTenantId().equals(authenticatedTenantId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized: Employee does not belong to your tenant"));
        }
        
        return authenticationService.updateEmployeeProfile(employeeId, request);
    }
    @GetMapping("/partner/profile")
    @PreAuthorize("hasAuthority('ROLE_PARTNER')")
    public ResponseEntity<?> getPartnerProfile(HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization").substring(7);
        String email = jwtService.extractUsername(token);
        Long authenticatedTenantId = jwtService.extractTenantId(token);

        Partner partner = partnerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        log.info("Authenticated Tenant ID: {}", authenticatedTenantId);
        log.info("Partner Tenant ID: {}", partner.getTenantId());

        if (!partner.getTenantId().equals(authenticatedTenantId)) {
            log.error("Tenant ID mismatch: authenticatedTenantId={}, partnerTenantId={}",
                      authenticatedTenantId, partner.getTenantId());
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized: Partner does not belong to your tenant"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", partner.getId());
        response.put("name", partner.getName());
        response.put("secondName", partner.getSecondName());
        response.put("tel", partner.getTel());
        response.put("email", partner.getEmail());
        response.put("companyName", partner.getCompanyName());
        response.put("address", partner.getAddress());
        response.put("companyType", partner.getCompanyType());
        response.put("website", partner.getWebsite());
        response.put("businessLicense", partner.getBusinessLicense());
        response.put("crn", partner.getCrn());
        response.put("logoUrl", partner.getLogoUrl());

        return ResponseEntity.ok(response);
    }
    @GetMapping("/employee/profile")
    @PreAuthorize("hasAnyAuthority('ROLE_PARTNER', 'ROLE_EMPLOYE')")
    public ResponseEntity<?> getEmployeeProfile(HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization").substring(7);
        String email = jwtService.extractUsername(token);
        Long authenticatedTenantId = jwtService.extractTenantId(token);

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getTenantId().equals(authenticatedTenantId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized: Employee does not belong to your tenant"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", employee.getId());
        response.put("name", employee.getName());
        response.put("secondName", employee.getSecondName());
        response.put("tel", employee.getTel());
        response.put("email", employee.getEmail());
        response.put("post", employee.getPost());
        response.put("department", employee.getDepartment());

        return ResponseEntity.ok(response);
    }
    
    

}
