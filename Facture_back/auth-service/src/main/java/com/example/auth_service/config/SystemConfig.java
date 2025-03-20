package com.example.auth_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "system")
@Component
@Getter
@Setter
public class SystemConfig {
    private String email;
    private String password;
    private String name;
    private String secondName;
    
    
}
