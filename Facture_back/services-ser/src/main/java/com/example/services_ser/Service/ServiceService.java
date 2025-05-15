package com.example.services_ser.Service;

import com.example.services_ser.DTO.ServiceDTO;
import com.example.services_ser.Repository.ServiceRepository;
import com.example.services_ser.model.Service;
import com.example.services_ser.security.JwtAuthentication;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@AllArgsConstructor
public class ServiceService {
    private static final Logger logger = LoggerFactory.getLogger(ServiceService.class);

    private final ServiceRepository serviceRepository;

    private Long getAuthenticatedTenantId() {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            logger.error("No authenticated tenant found");
            throw new IllegalStateException("No authenticated tenant found");
        }
        logger.debug("Authenticated tenant ID: {}", authentication.getTenantId());
        return authentication.getTenantId();
    }

    private Service toEntity(ServiceDTO dto) {
        Service service = new Service();
        service.setRef(dto.getRef());
        service.setServiceQuantity(dto.getServiceQuantity());
        service.setServiceName(dto.getServiceName());
        service.setServicePrice(dto.getServicePrice());
        return service;
    }

    private ServiceDTO toDTO(Service service) {
        ServiceDTO dto = new ServiceDTO();
        dto.setId(service.getId()); // Set id
        dto.setRef(service.getRef());
        dto.setServiceQuantity(service.getServiceQuantity());
        dto.setServiceName(service.getServiceName());
        dto.setServicePrice(service.getServicePrice());
        return dto;
    }

    @Transactional
    public ServiceDTO createService(ServiceDTO serviceDTO) {
        Long tenantId = getAuthenticatedTenantId();
        logger.info("Creating service for tenant: {}", tenantId);
        Service service = toEntity(serviceDTO);
        service.setTenantId(tenantId);
        Service savedService = serviceRepository.save(service);
        return toDTO(savedService);
    }

    public List<ServiceDTO> getAllServices() {
        Long tenantId = getAuthenticatedTenantId();
        logger.info("Fetching all services for tenant: {}", tenantId);
        return serviceRepository.findByTenantId(tenantId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ServiceDTO> getServiceById(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        logger.info("Fetching service with id: {} for tenant: {}", id, tenantId);
        return serviceRepository.findById(id)
                .filter(service -> {
                    boolean matches = service.getTenantId().equals(tenantId);
                    if (!matches) {
                        logger.warn("Service with id: {} does not belong to tenant: {}", id, tenantId);
                    }
                    return matches;
                })
                .map(this::toDTO);
    }

    @Transactional
    public ServiceDTO updateService(Long id, ServiceDTO serviceDTO) {
        Long tenantId = getAuthenticatedTenantId();
        logger.info("Updating service with id: {} for tenant: {}", id, serviceDTO);
        Service service = serviceRepository.findById(id)
                .filter(s -> {
                    boolean matches = s.getTenantId().equals(tenantId);
                    if (!matches) {
                        logger.warn("Service with id: {} does not belong to tenant: {}", id, tenantId);
                    }
                    return matches;
                })
                .orElseThrow(() -> {
                    logger.error("Service not found with id: {} for tenant: {}", id, tenantId);
                    return new RuntimeException("Service not found with id: " + id + " for tenant: " + tenantId);
                });

        service.setRef(serviceDTO.getRef());
        service.setServiceQuantity(serviceDTO.getServiceQuantity());
        service.setServiceName(serviceDTO.getServiceName());
        service.setServicePrice(serviceDTO.getServicePrice());

        Service updatedService = serviceRepository.save(service);
        return toDTO(updatedService);
    }

    @Transactional
    public void deleteService(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        logger.info("Deleting service with id: {} for tenant: {}", id, tenantId);
        Service service = serviceRepository.findById(id)
                .filter(s -> {
                    boolean matches = s.getTenantId().equals(tenantId);
                    if (!matches) {
                        logger.warn("Service with id: {} does not belong to tenant: {}", id, tenantId);
                    }
                    return matches;
                })
                .orElseThrow(() -> {
                    logger.error("Service not found with id: {} for tenant: {}", id, tenantId);
                    return new RuntimeException("Service not found with id: " + id + " for tenant: " + tenantId);
                });
        serviceRepository.deleteById(id);
    }
}