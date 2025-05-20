package com.example.facture.Repository;

import com.example.facture.models.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {
    boolean existsByFactureNumber(String factureNumber);
}