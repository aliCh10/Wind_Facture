package com.example.employee_service.service;

import com.example.auth_service.model.Partner;
import com.example.employee_service.Repository.EmployeeRepository;
import com.example.employee_service.client.AuthServiceClient;
import com.example.employee_service.dto.EmployeeDTO;
import com.example.employee_service.model.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.apache.commons.lang3.RandomStringUtils; 

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AuthServiceClient authServiceClient; 
    private final EmailService emailService;

    public ResponseEntity<?> addEmployee(Long tenantId, EmployeeDTO employeeDTO) {
        Partner partner = authServiceClient.getPartnerById(tenantId); 

        if (partner == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Partner not found"));
        }

        String generatedPassword = generateRandomPassword();

        Employee employee = Employee.builder()
                .name(employeeDTO.getName())
                .secondName(employeeDTO.getSecondName())
                .email(employeeDTO.getEmail())
                .post(employeeDTO.getPost())
                .department(employeeDTO.getDepartment())
                .tenantId(tenantId) 
                .partnerId(partner.getId().longValue())
                .password(generatedPassword)
                .build();

        employeeRepository.save(employee);

        emailService.sendPassword(employee.getEmail(), generatedPassword);

        return ResponseEntity.ok(Map.of(
            "message", "Employee added successfully",
            "employee", employeeDTO
        ));
    }    

    private String generateRandomPassword() {
        return RandomStringUtils.randomAlphanumeric(10) + "!"; // Génère un mot de passe aléatoire de 10 caractères + "!"
    }
}
