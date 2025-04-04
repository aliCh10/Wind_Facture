package com.example.employee_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.auth_service.model.Partner;
import com.example.employee_service.model.Employee;

@FeignClient(name = "auth-service", url = "http://localhost:8090") 
public interface AuthServiceClient {
    
    @PostMapping("/register") 
    Employee addEmployee(@RequestBody Employee employee);
    @GetMapping("/partners/{id}")
    Partner getPartnerById(@PathVariable("id") Long id);
}