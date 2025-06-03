package com.example.auth_service.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfilePartner {
    
    private String name;
    private String secondName;
    private String tel;
    private String companyName;
    private String address;
    private String companyType;
    private String website;
    private String businessLicense;
    private String crn;
    // private MultipartFile logo;
}
