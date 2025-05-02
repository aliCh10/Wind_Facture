package com.example.facture.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.facture.Repository.ModeleFactureRepository;
import com.example.facture.models.ModeleFacture;
import com.example.facture.models.Section;

@Service
public class ModeleFactureService {
    @Autowired
    private ModeleFactureRepository modeleFactureRepository;

    public ModeleFacture saveModeleFacture(String name, List<Section> sections) {
        ModeleFacture modeleFacture = new ModeleFacture();
        modeleFacture.setNameModel(name);
        modeleFacture.setCreatedAt(LocalDateTime.now());
        modeleFacture.setUpdatedAt(LocalDateTime.now());
        modeleFacture.setSections(sections); 
        // Link sections to the modeleFacture
        sections.forEach(section -> section.setModeleFacture(modeleFacture));

        return modeleFactureRepository.save(modeleFacture);
    }
    public Optional<ModeleFacture> getModeleFactureById(Long id) {
        return modeleFactureRepository.findById(id);
    }
    // ModeleFactureService.java
public List<ModeleFacture> getAllModeleFactures() {
    return modeleFactureRepository.findAllByOrderByCreatedAtDesc();
}
    
}
