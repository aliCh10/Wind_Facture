package com.example.auth_service.controller;

import com.example.auth_service.dto.AuthentificationRequest;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UpdateProfileRequest;
import com.example.auth_service.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("public")
@RequiredArgsConstructor
@Slf4j

public class AuthenticationController {

    private final AuthenticationService authenticationService;

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
    
    

}
