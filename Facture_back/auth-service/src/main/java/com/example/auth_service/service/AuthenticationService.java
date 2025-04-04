package com.example.auth_service.service;

import com.example.auth_service.Repository.PartnerRepository;
import com.example.auth_service.Repository.UserRepository;
import com.example.auth_service.config.JwtService;
import com.example.auth_service.config.SystemConfig;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UpdateProfileRequest;
import com.example.auth_service.model.Partner;
import com.example.auth_service.model.Role;
import com.example.auth_service.model.User;
import com.example.auth_service.token.Token;
import com.example.auth_service.token.TokenRepository;
import com.example.auth_service.token.TokenType;

import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PartnerRepository partnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final CloudinaryService cloudinaryService;
    @Autowired
    private SystemConfig systemConfig;
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$");


    public ResponseEntity<?> register(RegisterRequest request, MultipartFile file) {
        if (partnerRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }
    
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }
    
        if (!PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must contain at least 8 characters, one uppercase letter, and one special character."));
        }
    
        String imageUrl = null;
        try {
            if (file != null && !file.isEmpty()) {
                imageUrl = cloudinaryService.uploadImage(file);
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Image upload failed"));
        }
    
        Long tenantId = generateTenantId();
    
        Partner partner = partnerRepository.save(Partner.builder()
            .name(request.getName())
            .secondName(request.getSecondName())
            .email(request.getEmail())
            .tel(request.getTel())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.PARTNER)
            .companyName(request.getCompanyName())
            .companyType(request.getCompanytype())
            .address(request.getAddress())
            .enabled(false)
            .companyType(request.getCompanytype())
            .logoUrl(imageUrl)
            .validated(false)
            .tenantId(tenantId) 
            .build());
    
        String verificationCode = generateVerificationCode();
        partner.setVerificationCode(verificationCode);
        partnerRepository.save(partner);
    
        try {
            emailService.sendVerificationCode(partner.getEmail(), verificationCode);
            log.info("📧 Email de vérification envoyé à {}", partner.getEmail());
        } catch (MessagingException e) {
            log.error("❌ Erreur d'envoi de l'email de vérification à {} : {}", partner.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Error sending verification email"));
        }
    
        return ResponseEntity.ok(Map.of("message", "Registration successful. Check your email for the verification code."));
    }
    
    private Long generateTenantId() {
        return System.currentTimeMillis(); 
    }
    @PostConstruct
public void createSystemAccount() {
    String systemEmail = systemConfig.getEmail();
    String systemPassword = systemConfig.getPassword();
    String systemName = systemConfig.getName();
    String systemSecondName = systemConfig.getSecondName();

    if (userRepository.findByEmail(systemEmail).isEmpty()) {
        log.info("Creating system account...");
        User systemUser = User.builder()
                .name(systemName)
                .secondName(systemSecondName)
                .email(systemEmail)
                .password(passwordEncoder.encode(systemPassword))  
                .role(Role.System)
                .enabled(true)
                .validated(true)
                .tenantId(0L) 
                .build();

        userRepository.save(systemUser);

        String jwtToken = jwtService.generateToken(systemUser, systemUser.getTenantId());
        Token token = Token.builder()
                .user(systemUser)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);

        log.info("✅ System account created successfully!");
        log.info("🔑 Token: {}", jwtToken);
    } else {
        log.info("✅ System account already exists.");
    }
}


public ResponseEntity<?> verifyCode(String email, String code) {
    return userRepository.findByEmail(email)
            .filter(user -> Objects.equals(user.getVerificationCode(), code))
            .map(user -> {
                user.setEnabled(true); 
                user.setVerificationCode(null); 
                userRepository.save(user);

                return ResponseEntity.ok(Map.of("message", "Account verified successfully. Please log in."));
            })
            .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("message", "Invalid verification code")));
}
    public ResponseEntity<?> authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    
        if (!user.isValidated()) { 
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Votre compte n'a pas été validé depuis le système"));
        }
    
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
    
        Long tenantId = user.getTenantId(); 
        String jwtToken = jwtService.generateToken(user, tenantId);
    
        return ResponseEntity.ok(Map.of(
            "token", jwtToken,
            "role", user.getRole(),
            "name", user.getName(),
            "secondName", user.getSecondName(),
            "tenantId", tenantId ,
            "id", user.getId()  
        ));
    }
    

    public ResponseEntity<?> forgotPassword(String email) {
        log.info("📩 Demande de réinitialisation du mot de passe pour {}", email);

        return userRepository.findByEmail(email)
                .map(user -> {
                    String resetCode = generateVerificationCode();
                    user.setVerificationCode(resetCode);
                    userRepository.save(user);

                    try {
                        emailService.sendPasswordResetCode(user.getEmail(), resetCode);
                        log.info("📧 Email de réinitialisation envoyé à {}", user.getEmail());
                    } catch (MessagingException e) {
                        log.error("❌ Erreur lors de l'envoi de l'email de réinitialisation : {}", e.getMessage());
                        return ResponseEntity.badRequest().body(Map.of("message", "Error sending reset email"));
                    }

                    return ResponseEntity.ok(Map.of("message", "Password reset code sent"));
                })
                .orElseGet(() -> {
                    log.warn("⚠️ Utilisateur non trouvé pour {}", email);
                    return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
                });
    }

    public ResponseEntity<?> resetPassword(String email, String code, String newPassword) {
        return userRepository.findByEmail(email)
                .filter(user -> Objects.equals(user.getVerificationCode(), code))
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    user.setVerificationCode(null);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Password successfully updated"));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("message", "Invalid code or password")));
    }

    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }

    private String generateAndSaveToken(User user) {
        Long tenantId = user.getTenantId(); // Récupérer le tenantId de l'utilisateur
        String jwtToken = jwtService.generateToken(user, tenantId); // Générer le token avec le tenantId
    
        revokeAllUserTokens(user);
        Token token = Token.builder()
            .user(user)
            .token(jwtToken)
            .tokenType(TokenType.BEARER)
            .expired(false)
            .revoked(false)
            .build();
        tokenRepository.save(token);
    
        return jwtToken;
    }
    private void revokeAllUserTokens(User user) {
        tokenRepository.findAllValidTokenByUser(user.getId())
                .forEach(token -> {
                    token.setExpired(true);
                    token.setRevoked(true);
                    tokenRepository.save(token);
                });
    }
    public ResponseEntity<?> updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User  not found"));
    
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getSecondName() != null) {
            user.setSecondName(request.getSecondName());
        }
        if (request.getTel() != null) {
            user.setTel(request.getTel());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
            
        }
       
       
        userRepository.save(user);
    
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
    

    
}
