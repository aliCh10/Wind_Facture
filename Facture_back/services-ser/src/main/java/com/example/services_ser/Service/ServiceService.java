package com.example.services_ser.Service;

import com.example.services_ser.Repository.ServiceRepository;
import com.example.services_ser.model.Service;
import com.example.services_ser.security.JwtAuthentication; // Reuse from Client_service
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
@AllArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;

    // Helper method to get tenantId from authenticated user
    private Long getAuthenticatedTenantId() {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            throw new IllegalStateException("No authenticated tenant found");
        }
        return authentication.getTenantId();
    }

    // Create a new service
    public Service createService(Service service) {
        Long tenantId = getAuthenticatedTenantId();
        service.setTenantId(tenantId);
        return serviceRepository.save(service);
    }

    // Get all services for the authenticated tenant
    // test test changement
    public List<Service> getAllServices() {
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findByTenantId(tenantId);
    }

    // Get a service by ID for the authenticated tenant
    public Optional<Service> getServiceById(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findById(id)
                .filter(service -> service.getTenantId().equals(tenantId));
    }

    // Update a service for the authenticated tenant
    @Transactional
    public Service updateService(Long id, Service serviceDetails) {
        Long tenantId = getAuthenticatedTenantId();
        Service service = serviceRepository.findById(id)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id + " for tenant: " + tenantId));

        service.setRef(serviceDetails.getRef());
        service.setServiceQuantity(serviceDetails.getServiceQuantity());
        service.setServiceName(serviceDetails.getServiceName());
        service.setServicePrice(serviceDetails.getServicePrice());

        return service;
    }

    // Delete a service for the authenticated tenant
    @Transactional
    public void deleteService(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        Service service = serviceRepository.findById(id)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id + " for tenant: " + tenantId));
        serviceRepository.deleteById(id);
    }
}