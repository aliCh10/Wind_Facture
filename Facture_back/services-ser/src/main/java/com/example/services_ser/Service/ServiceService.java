package com.example.services_ser.Service;

import com.example.services_ser.DTO.ServiceDTO;
import com.example.services_ser.Repository.ServiceRepository;
import com.example.services_ser.model.Service;
import com.example.services_ser.security.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceService {

    private final ServiceRepository serviceRepository;

    private Long getAuthenticatedTenantId() {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            throw new IllegalStateException("No authenticated tenant found");
        }
        return authentication.getTenantId();
    }

    // Méthode pour convertir Entity vers DTO
    private ServiceDTO convertToDTO(Service service) {
        return new ServiceDTO(
                service.getId(),
                service.getRef(),
                service.getServiceName(),
                service.getServicePrice()
        );
    }

    // Méthode pour convertir DTO vers Entity
    private Service convertToEntity(ServiceDTO serviceDTO) {
        Service service = new Service();
        service.setId(serviceDTO.getId());
        service.setRef(serviceDTO.getRef());
        service.setServiceName(serviceDTO.getServiceName());
        service.setServicePrice(serviceDTO.getServicePrice());
        return service;
    }

    @Transactional
    public ServiceDTO createService(ServiceDTO serviceDTO) {
        Service service = convertToEntity(serviceDTO);
        service.setTenantId(getAuthenticatedTenantId());
        Service savedService = serviceRepository.save(service);
        return convertToDTO(savedService);
    }

    public List<ServiceDTO> getAllServices() {
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findByTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ServiceDTO> getServiceById(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findByIdAndTenantId(id, tenantId)
                .map(this::convertToDTO);
    }

    @Transactional
    public Optional<ServiceDTO> updateService(Long id, ServiceDTO serviceDTO) {
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findByIdAndTenantId(id, tenantId)
                .map(existingService -> {
                    existingService.setRef(serviceDTO.getRef());
                    existingService.setServiceName(serviceDTO.getServiceName());
                    existingService.setServicePrice(serviceDTO.getServicePrice());
                    Service updatedService = serviceRepository.save(existingService);
                    return convertToDTO(updatedService);
                });
    }

    @Transactional
    public boolean deleteService(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findByIdAndTenantId(id, tenantId)
                .map(service -> {
                    serviceRepository.delete(service);
                    return true;
                })
                .orElse(false);
    }
}