package com.example.auth_service.controller;

import com.example.auth_service.config.JwtService;
import com.example.auth_service.dto.AuthentificationRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UpdateProfileRequest;
import com.example.auth_service.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
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
       @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, @RequestParam Long userId) {
        return authenticationService.updateProfile(userId, request);
    }
    @GetMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestParam String token) {
        try {
            String email = jwtService.extractUsername(token);  // Extraire l'email de l'utilisateur depuis le token
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);  // Charger les détails de l'utilisateur
            if (jwtService.isTokenValid(token, userDetails)) {  // Vérifier que le token est valide
                // Vérifier que l'utilisateur a le rôle ROLE_PARTNER
                if (userDetails.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_PARTNER"))) {
                    return ResponseEntity.ok("Token is valid and role is correct");
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
    
    
    

}
