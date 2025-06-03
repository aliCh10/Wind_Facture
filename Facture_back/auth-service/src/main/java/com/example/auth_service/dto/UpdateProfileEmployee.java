package com.example.auth_service.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileEmployee {
    private String name;
    private String secondName;
    private String tel;
    private String post;
    private String department;
    
 
}
    
