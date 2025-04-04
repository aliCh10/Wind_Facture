package com.example.auth_service.service;

import com.example.auth_service.Repository.UserRepository;
import com.example.auth_service.dto.EmployeeRegisterRequest;
import com.example.auth_service.model.Employee;
import com.example.auth_service.model.Role;
import com.example.auth_service.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);
    private static final int PASSWORD_LENGTH = 8; // Configurable

    public ResponseEntity<?> addEmployee(Long partnerId, EmployeeRegisterRequest request) {
        logger.info("Starting employee registration process...");

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            logger.warn("Email {} is already in use", request.getEmail());
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        User partnerUser = findPartnerUser(partnerId);
        if (partnerUser == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Partner not found with ID " + partnerId));
        }

        String generatedPassword = generateSecurePassword();
        String encodedPassword = passwordEncoder.encode(generatedPassword);

        Employee employee = new Employee();
        employee.setName(request.getName());
        employee.setSecondName(request.getSecondName());
        employee.setTel(request.getTel());
        employee.setEmail(request.getEmail());
        employee.setPassword(encodedPassword);
        employee.setRole(Role.EMPLOYE);
        employee.setPost(request.getPost());
        employee.setDepartment(request.getDepartment());
        employee.setPartnerUser(partnerUser);
        employee.setTenantId(partnerUser.getTenantId());
        employee.setEnabled(true);
        employee.setValidated(true);

        userRepository.save(employee);
        logger.info("Employee {} successfully saved with ID {}", employee.getEmail(), employee.getId());

        try {
            emailService.sendAccountCredentials(employee.getEmail(), generatedPassword);
            logger.info("Email sent successfully to {}", employee.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send email: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Employee added, but failed to send email"));
        }

        return ResponseEntity.ok(Map.of("message", "Employee added successfully and password sent to email"));
    }

    private User findPartnerUser(Long partnerId) {
        return userRepository.findById(partnerId)
                .filter(user -> user.getRole() == Role.PARTNER)
                .orElseThrow(() -> new RuntimeException("No Partner user found with ID " + partnerId));
    }

    private String generateSecurePassword() {
        final String UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        final String LOWER_CASE = "abcdefghijklmnopqrstuvwxyz";
        final String SPECIAL_CHARS = "!@#$%^&*";
        final String DIGITS = "0123456789";

        SecureRandom random = new SecureRandom();
        List<Character> passwordChars = new ArrayList<>();

        passwordChars.add(UPPER_CASE.charAt(random.nextInt(UPPER_CASE.length())));
        passwordChars.add(LOWER_CASE.charAt(random.nextInt(LOWER_CASE.length())));
        passwordChars.add(SPECIAL_CHARS.charAt(random.nextInt(SPECIAL_CHARS.length())));
        passwordChars.add(DIGITS.charAt(random.nextInt(DIGITS.length())));

        String allChars = UPPER_CASE + LOWER_CASE + SPECIAL_CHARS + DIGITS;
        for (int i = passwordChars.size(); i < PASSWORD_LENGTH; i++) {
            passwordChars.add(allChars.charAt(random.nextInt(allChars.length())));
        }

        Collections.shuffle(passwordChars, random);

        StringBuilder finalPassword = new StringBuilder();
        for (char c : passwordChars) {
            finalPassword.append(c);
        }

        String generatedPassword = finalPassword.toString();
        logger.debug("Generated password: {}", generatedPassword);
        return generatedPassword;
    }
    public ResponseEntity<?> getEmployeeById(Long employeeId) {
        logger.info("Fetching employee with ID: {}", employeeId);
    
        // Chercher l'employé dans la base de données
        Employee employee = (Employee) userRepository.findById(employeeId)
                .filter(user -> user.getRole() == Role.EMPLOYE)
                .orElse(null);
    
        // Vérifier si l'employé existe
        if (employee == null) {
            logger.warn("Employee with ID {} not found", employeeId);
            return ResponseEntity.badRequest().body(Map.of("message", "Employee not found"));
        }
    
        logger.info("Employee with ID {} found", employeeId);
        return ResponseEntity.ok(employee);
    }
    public ResponseEntity<?> getAllEmployees() {
        logger.info("Fetching all employees...");
    
        // Récupérer tous les utilisateurs
        List<User> users = userRepository.findAll();
    
        // Filtrer les employés et les convertir en Employee
        List<Employee> employees = users.stream()
                .filter(user -> user.getRole() == Role.EMPLOYE)
                .map(user -> (Employee) user)  // Caster l'utilisateur en Employee
                .collect(Collectors.toList());
    
        // Vérifier s'il y a des employés
        if (employees.isEmpty()) {
            logger.warn("No employees found");
            return ResponseEntity.status(404).body(Map.of("message", "No employees found"));
        }
    
        logger.info("Successfully fetched all employees");
        return ResponseEntity.ok(employees);
    }
    
public ResponseEntity<?> updateEmployee(Long employeeId, EmployeeRegisterRequest request) {
    logger.info("Updating employee with ID: {}", employeeId);

    // Chercher l'employé dans la base de données
    Employee employee = (Employee) userRepository.findById(employeeId)
            .filter(user -> user.getRole() == Role.EMPLOYE)
            .orElse(null);

    if (employee == null) {
        logger.warn("Employee with ID {} not found", employeeId);
        return ResponseEntity.badRequest().body(Map.of("message", "Employee not found"));
    }

    // Mettre à jour les informations de l'employé
    employee.setName(request.getName());
    employee.setSecondName(request.getSecondName());
    employee.setTel(request.getTel());
    employee.setEmail(request.getEmail());
    employee.setPost(request.getPost());
    employee.setDepartment(request.getDepartment());

    userRepository.save(employee);
    logger.info("Employee with ID {} updated successfully", employeeId);

    return ResponseEntity.ok(Map.of("message", "Employee updated successfully"));
}
public ResponseEntity<?> deleteEmployee(Long employeeId) {
    logger.info("Deleting employee with ID: {}", employeeId);

    Employee employee = (Employee) userRepository.findById(employeeId)
            .filter(user -> user.getRole() == Role.EMPLOYE)
            .orElse(null);

    if (employee == null) {
        logger.warn("Employee with ID {} not found", employeeId);
        return ResponseEntity.badRequest().body(Map.of("message", "Employee not found"));
    }

    userRepository.delete(employee);
    logger.info("Employee with ID {} deleted successfully", employeeId);

    return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
}
public ResponseEntity<?> changePassword(Long employeeId, String newPassword) {
    logger.info("Changing password for employee with ID: {}", employeeId);

    Employee employee = (Employee) userRepository.findById(employeeId)
            .filter(user -> user.getRole() == Role.EMPLOYE)
            .orElse(null);

    if (employee == null) {
        logger.warn("Employee with ID {} not found", employeeId);
        return ResponseEntity.badRequest().body(Map.of("message", "Employee not found"));
    }

    String encodedPassword = passwordEncoder.encode(newPassword);

    employee.setPassword(encodedPassword);

    userRepository.save(employee);
    logger.info("Password for employee with ID {} successfully updated", employeeId);

    return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
}
    
    
}
