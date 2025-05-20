package com.example.services_ser.Repository;
import com.example.services_ser.model.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByTenantId(Long tenantId);
        Optional<Service> findByIdAndTenantId(Long id, Long tenantId);

}