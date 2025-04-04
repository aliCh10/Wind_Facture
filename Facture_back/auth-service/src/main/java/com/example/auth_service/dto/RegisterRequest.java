package com.example.auth_service.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
@AllArgsConstructor
@Setter
@Getter
@NoArgsConstructor
public class RegisterRequest {
     @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Second name is required")
    private String secondName;
    @NotBlank(message = "tel is required")
    private String tel;

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    @Column(unique = true) 
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Type is required")
    private String companytype;

     private MultipartFile logo;
     private String post; 
     private String department; 



   



    
}
