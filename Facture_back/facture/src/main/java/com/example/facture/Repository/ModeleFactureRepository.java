package com.example.facture.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.facture.models.ModeleFacture;

public interface ModeleFactureRepository extends JpaRepository<ModeleFacture, Long> {    
    List<ModeleFacture> findAllByOrderByCreatedAtDesc();
     Optional<ModeleFacture> findByIdAndTenantId(Long id, Long tenantId);
    List<ModeleFacture> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    boolean existsByIdAndTenantId(Long id, Long tenantId);

}