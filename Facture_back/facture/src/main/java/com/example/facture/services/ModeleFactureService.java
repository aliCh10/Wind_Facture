package com.example.facture.services;

import com.example.facture.DTO.CreateModeleFactureRequest;
import com.example.facture.Repository.ModeleFactureRepository;
import com.example.facture.models.ModeleFacture;
import com.example.facture.models.Section;
import com.example.facture.models.SectionContent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ModeleFactureService {

    private final PdfGenerationService pdfGenerationService;
    private final ModeleFactureRepository modeleFactureRepository;
        private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);


    public ModeleFactureService(ModeleFactureRepository modeleFactureRepository, PdfGenerationService pdfGenerationService) {
        this.modeleFactureRepository = modeleFactureRepository;
        this.pdfGenerationService = pdfGenerationService;
    }

    @Transactional
    public ModeleFacture saveModeleFacture(CreateModeleFactureRequest request) {
        ModeleFacture modeleFacture = new ModeleFacture();
        modeleFacture.setNameModel(request.getName());
        modeleFacture.setCreatedAt(LocalDateTime.now());
        modeleFacture.setUpdatedAt(LocalDateTime.now());

        List<Section> sections = request.getSections().stream().map(sectionDTO -> {
            Section section = new Section();
            section.setSectionName(sectionDTO.getSectionName());
            section.setX(sectionDTO.getX());
            section.setY(sectionDTO.getY());
            section.setStyles(sectionDTO.getStyles());
            section.setModeleFacture(modeleFacture);

            SectionContent content = new SectionContent();
            content.setContentData(sectionDTO.getContent().getContentData());
            content.setSection(section);
            section.setContent(content);

            return section;
        }).collect(Collectors.toList());

        modeleFacture.setSections(sections);
        return modeleFactureRepository.save(modeleFacture);
    }

    public Optional<ModeleFacture> getModeleFactureById(Long id) {
        Optional<ModeleFacture> modeleFactureOpt = modeleFactureRepository.findById(id);
        modeleFactureOpt.ifPresent(modeleFacture -> {
            logger.info("Retrieved ModeleFacture ID: {}", modeleFacture.getId());
            modeleFacture.getSections().forEach(section -> 
                logger.info("Section {}: x={}, y={}", 
                    section.getSectionName(), section.getX(), section.getY())
            );
        });
        return modeleFactureOpt;
    }

    public List<ModeleFacture> getAllModeleFactures() {
        return modeleFactureRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public boolean deleteModeleFacture(Long id) {
        if (modeleFactureRepository.existsById(id)) {
            modeleFactureRepository.deleteById(id);
            return true;
        }
        return false;
    }
  public byte[] generateModeleFacturePdf(Long id, Map<String, String> clientData) {
    Optional<ModeleFacture> modeleFacture = getModeleFactureById(id);
    if (modeleFacture.isPresent()) {
        return pdfGenerationService.generatePdfFromModele(modeleFacture.get(), clientData);
    } else {
        throw new RuntimeException("ModeleFacture with ID " + id + " not found");
    }
}
public ModeleFacture getModeleFacture(Long id) {
    return modeleFactureRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " + id));
}
  public byte[] generateModeleFactureThumbnail(Long id) {
        logger.info("Generating thumbnail for ModeleFacture ID: {}", id);
        Optional<ModeleFacture> modeleFacture = getModeleFactureById(id);
        if (modeleFacture.isPresent()) {
            return pdfGenerationService.generateThumbnailFromModele(modeleFacture.get(), Collections.emptyMap());
        } else {
            logger.error("ModeleFacture with ID {} not found", id);
            throw new RuntimeException("ModeleFacture with ID " + id + " not found");
        }
    }

}