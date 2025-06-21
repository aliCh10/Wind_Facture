package com.example.auth_service.service;

import com.example.auth_service.Repository.EmployeeRepository;
import com.example.auth_service.Repository.UserRepository;
import com.example.auth_service.config.JwtService;
import com.example.auth_service.dto.EmployeeRegisterRequest;
import com.example.auth_service.model.Employee;
import com.example.auth_service.model.Role;
import com.example.auth_service.model.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final EmployeeRepository employeeRepository;
    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);
    private static final int PASSWORD_LENGTH = 8;

    // Helper method to extract tenantId from JWT
    private Long getAuthenticatedTenantId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("No Bearer token found in Authorization header");
            throw new IllegalStateException("No Bearer token found in Authorization header");
        }
        String token = authHeader.substring(7);
        Long tenantId = jwtService.extractTenantId(token);
        if (tenantId == null) {
            logger.error("No tenantId found in JWT");
            throw new IllegalStateException("No tenantId found in JWT");
        }
        return tenantId;
    }

    public ResponseEntity<?> addEmployee(Long partnerId, EmployeeRegisterRequest request, HttpServletRequest httpRequest) {
        logger.info("Starting employee registration process for partnerId: {}", partnerId);

        Long authenticatedTenantId = getAuthenticatedTenantId(httpRequest);

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            logger.warn("Email {} is already in use", request.getEmail());
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        User partnerUser = findPartnerUser(partnerId);
        if (!partnerUser.getTenantId().equals(authenticatedTenantId)) {
            logger.warn("PartnerId {} does not belong to authenticated tenant {}", partnerId, authenticatedTenantId);
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized: Partner does not belong to your tenant"));
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

    public ResponseEntity<?> getEmployeeById(Long employeeId, HttpServletRequest httpRequest) {
        logger.info("Fetching employee with ID: {}", employeeId);

        Long authenticatedTenantId = getAuthenticatedTenantId(httpRequest);

        Employee employee = (Employee) userRepository.findById(employeeId)
                .filter(user -> user.getRole() == Role.EMPLOYE && user.getTenantId().equals(authenticatedTenantId))
                .orElse(null);

        if (employee == null) {
            logger.warn("Employee with ID {} not found for tenant {}", employeeId, authenticatedTenantId);
            return ResponseEntity.badRequest().body(Map.of("message", "Employee not found or not in your tenant"));
        }

        logger.info("Employee with ID {} found for tenant {}", employeeId, authenticatedTenantId);
        return ResponseEntity.ok(employee);
    }

    public ResponseEntity<?> getAllEmployees(HttpServletRequest httpRequest, Pageable pageable) {
        logger.info("Fetching all employees for tenant with pagination...");

        Long authenticatedTenantId = getAuthenticatedTenantId(httpRequest);

        Specification<Employee> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), authenticatedTenantId));
            predicates.add(cb.equal(root.get("role"), Role.EMPLOYE));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Employee> employeesPage = employeeRepository.findAll(spec, pageable);

        if (employeesPage.isEmpty()) {
            logger.warn("No employees found for tenant {}", authenticatedTenantId);
            return ResponseEntity.status(404).body(Map.of("message", "No employees found in your tenant"));
        }

        logger.info("Successfully fetched {} employees for tenant {}", employeesPage.getTotalElements(), authenticatedTenantId);
        return ResponseEntity.ok(Map.of(
            "content", employeesPage.getContent(),
            "page", employeesPage.getNumber(),
            "size", employeesPage.getSize(),
            "totalElements", employeesPage.getTotalElements(),
            "totalPages", employeesPage.getTotalPages()
        ));
    }

    public ResponseEntity<?> updateEmployee(Long employeeId, EmployeeRegisterRequest request, HttpServletRequest httpRequest) {
        logger.info("Updating employee with ID: {}", employeeId);

        Long authenticatedTenantId = getAuthenticatedTenantId(httpRequest);

        Employee employee = (Employee) userRepository.findById(employeeId)
                .filter(user -> user.getRole() == Role.EMPLOYE && user.getTenantId().equals(authenticatedTenantId))
                .orElse(null);

        if (employee == null) {
            logger.warn("Employee with ID {} not found for tenant {}", employeeId, authenticatedTenantId);
            return ResponseEntity.badRequest().body(Map.of("message", "Employee not found or not in your tenant"));
        }

        employee.setName(request.getName());
        employee.setSecondName(request.getSecondName());
        employee.setTel(request.getTel());
        employee.setEmail(request.getEmail());
        employee.setPost(request.getPost());
        employee.setDepartment(request.getDepartment());

        userRepository.save(employee);
        logger.info("Employee with ID {} updated successfully for tenant {}", employeeId, authenticatedTenantId);

        return ResponseEntity.ok(Map.of("message", "Employee updated successfully"));
    }

    public ResponseEntity<?> deleteEmployee(Long employeeId, HttpServletRequest httpRequest) {
        logger.info("Deleting employee with ID: {}", employeeId);

        Long authenticatedTenantId = getAuthenticatedTenantId(httpRequest);

        Employee employee = (Employee) userRepository.findById(employeeId)
                .filter(user -> user.getRole() == Role.EMPLOYE && user.getTenantId().equals(authenticatedTenantId))
                .orElse(null);

        if (employee == null) {
            logger.warn("Employee with ID {} not found for tenant {}", employeeId, authenticatedTenantId);
            return ResponseEntity.badRequest().body(Map.of("message", "Employee not found or not in your tenant"));
        }

        userRepository.delete(employee);
        logger.info("Employee with ID {} deleted successfully for tenant {}", employeeId, authenticatedTenantId);

        return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
    }

    public ResponseEntity<?> changePassword(Long employeeId, String newPassword, HttpServletRequest httpRequest) {
        logger.info("Changing password for employee with ID: {}", employeeId);

        Long authenticatedTenantId = getAuthenticatedTenantId(httpRequest);

        Employee employee = (Employee) userRepository.findById(employeeId)
                .filter(user -> user.getRole() == Role.EMPLOYE && user.getTenantId().equals(authenticatedTenantId))
                .orElse(null);

        if (employee == null) {
            logger.warn("Employee with ID {} not found for tenant {}", employeeId, authenticatedTenantId);
            return ResponseEntity.badRequest().body(Map.of("message", "Employee not found or not in your tenant"));
        }

        String encodedPassword = passwordEncoder.encode(newPassword);
        employee.setPassword(encodedPassword);

        userRepository.save(employee);
        logger.info("Password for employee with ID {} successfully updated for tenant {}", employeeId, authenticatedTenantId);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    public ResponseEntity<?> searchEmployeesByName(String name, HttpServletRequest httpRequest, Pageable pageable) {
        logger.info("Searching employees with name: {} for tenant with pagination...", name);

        Long authenticatedTenantId = getAuthenticatedTenantId(httpRequest);

        Specification<Employee> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), authenticatedTenantId));
            predicates.add(cb.equal(root.get("role"), Role.EMPLOYE));
            if (name != null && !name.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Employee> employeesPage = employeeRepository.findAll(spec, pageable);

        if (employeesPage.isEmpty()) {
            logger.warn("No employees found with name {} for tenant {}", name, authenticatedTenantId);
            return ResponseEntity.status(404).body(Map.of("message", "No employees found matching the name"));
        }

        logger.info("Found {} employees with name {} for tenant {}", employeesPage.getTotalElements(), name, authenticatedTenantId);
        return ResponseEntity.ok(Map.of(
            "content", employeesPage.getContent(),
            "page", employeesPage.getNumber(),
            "size", employeesPage.getSize(),
            "totalElements", employeesPage.getTotalElements(),
            "totalPages", employeesPage.getTotalPages()
        ));
    }
}