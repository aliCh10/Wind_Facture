package com.example.services_ser.Service;

import com.example.services_ser.DTO.ServiceDTO;
import com.example.services_ser.Repository.ServiceRepository;
import com.example.services_ser.model.Service;
import com.example.services_ser.security.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    private ServiceDTO convertToDTO(Service service) {
        return new ServiceDTO(
                service.getId(),
                service.getRef(),
                service.getServiceName(),
                service.getServicePrice()
        );
    }

    private Service convertToEntity(ServiceDTO serviceDTO) {
        Service service = new Service();
        service.setId(serviceDTO.getId());
        service.setRef(serviceDTO.getRef());
        service.setServiceName(serviceDTO.getServiceName());
        service.setServicePrice(serviceDTO.getServicePrice());
        service.setTenantId(getAuthenticatedTenantId());
        return service;
    }

    @Transactional
    public ServiceDTO createService(ServiceDTO serviceDTO) {
        if (serviceDTO == null || serviceDTO.getRef() == null || serviceDTO.getRef().trim().isEmpty()) {
            throw new IllegalArgumentException("Service reference cannot be null or empty");
        }
        Long tenantId = getAuthenticatedTenantId();
        if (serviceRepository.findByRefAndTenantId(serviceDTO.getRef(), tenantId).isPresent()) {
            throw new RuntimeException("Service reference " + serviceDTO.getRef() + " already exists for tenant: " + tenantId);
        }
        Service service = convertToEntity(serviceDTO);
        service.setId(null); // Ensure ID is not set for new entities
        Service savedService = serviceRepository.save(service);
        return convertToDTO(savedService);
    }

    public Page<ServiceDTO> getAllServices(Pageable pageable) {
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findByTenantId(tenantId, pageable)
                .map(this::convertToDTO);
    }

    public Optional<ServiceDTO> getServiceById(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findByIdAndTenantId(id, tenantId)
                .map(this::convertToDTO);
    }

    @Transactional
    public ServiceDTO updateService(Long id, ServiceDTO serviceDTO) {
        if (serviceDTO == null || serviceDTO.getRef() == null || serviceDTO.getRef().trim().isEmpty()) {
            throw new IllegalArgumentException("Service reference cannot be null or empty");
        }
        Long tenantId = getAuthenticatedTenantId();
        Service service = serviceRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id + " for tenant: " + tenantId));

        Optional<Service> existingRefService = serviceRepository.findByRefAndTenantId(serviceDTO.getRef(), tenantId);
        if (existingRefService.isPresent() && !existingRefService.get().getId().equals(id)) {
            throw new RuntimeException("Service reference " + serviceDTO.getRef() + " already exists for another service in tenant: " + tenantId);
        }

        service.setRef(serviceDTO.getRef());
        service.setServiceName(serviceDTO.getServiceName());
        service.setServicePrice(serviceDTO.getServicePrice());
        return convertToDTO(service); // No need to save() due to @Transactional
    }

    @Transactional
    public void deleteService(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        Service service = serviceRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id + " for tenant: " + tenantId));
        serviceRepository.delete(service);
    }

    public Page<ServiceDTO> searchServices(ServiceDTO serviceDTO, Pageable pageable) {
        Long tenantId = getAuthenticatedTenantId();

        Specification<Service> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), tenantId));

            if (serviceDTO.getServiceName() != null && !serviceDTO.getServiceName().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("serviceName")),
                        "%" + serviceDTO.getServiceName().trim().toLowerCase() + "%"));
            }
            if (serviceDTO.getRef() != null && !serviceDTO.getRef().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("ref")),
                        "%" + serviceDTO.getRef().trim().toLowerCase() + "%"));
            }
            if (serviceDTO.getServicePrice() != null) {
                predicates.add(cb.equal(root.get("servicePrice"), serviceDTO.getServicePrice()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return serviceRepository.findAll(spec, pageable).map(this::convertToDTO);
    }

    public Page<ServiceDTO> searchServicesByName(String name, Pageable pageable) {
        if (name == null || name.trim().isEmpty()) {
            return getAllServices(pageable);
        }
        Long tenantId = getAuthenticatedTenantId();
        return serviceRepository.findByTenantIdAndServiceNameContainingIgnoreCase(tenantId, name.trim(), pageable)
                .map(this::convertToDTO);
    }
}