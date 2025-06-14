package com.example.facture.Repository;

import com.example.facture.models.Facture;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {
    boolean existsByFactureNumber(String factureNumber);
        List<Facture> findByTenantId(Long tenantId);
        Optional<Facture> findById(Long id);
        Optional<Facture> findByIdAndTenantId(Long id, Long tenantId);


}