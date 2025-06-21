package com.example.Client_service.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.example.Client_service.model.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {
Page<Client> findByTenantId(Long tenantId, Pageable pageable);

    Optional<Client> findByClientPhoneAndTenantId(String clientPhone, Long tenantId);
    Optional<Client> findByRibAndTenantId(String rib, Long tenantId);}