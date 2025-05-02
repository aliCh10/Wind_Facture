package com.example.facture.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.facture.models.ModeleFacture;

public interface ModeleFactureRepository extends JpaRepository<ModeleFacture, Long> {    
    List<ModeleFacture> findAllByOrderByCreatedAtDesc();

}