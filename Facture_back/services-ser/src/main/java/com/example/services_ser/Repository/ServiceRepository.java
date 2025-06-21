package com.example.services_ser.Repository;

import com.example.services_ser.model.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long>, JpaSpecificationExecutor<Service> {
    Page<Service> findByTenantId(Long tenantId, Pageable pageable);
    Page<Service> findByTenantIdAndServiceNameContainingIgnoreCase(Long tenantId, String name, Pageable pageable);
    Optional<Service> findByRefAndTenantId(String ref, Long tenantId);
    Optional<Service> findByIdAndTenantId(Long id, Long tenantId);
}