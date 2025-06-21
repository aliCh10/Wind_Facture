package com.example.facture.Repository;

import com.example.facture.models.Facture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {
    boolean existsByFactureNumber(String factureNumber);
    Optional<Facture> findById(Long id);
    Optional<Facture> findByIdAndTenantId(Long id, Long tenantId);
    List<Facture> findByTenantIdAndIssueDateBetween(Long tenantId, LocalDate startDate, LocalDate endDate);
    long countByTenantId(Long tenantId);

    @Query("SELECT f FROM Facture f LEFT JOIN FETCH f.factureServices WHERE f.tenantId = :tenantId")
    Page<Facture> findByTenantId(Long tenantId, Pageable pageable); // Corrected method name
}