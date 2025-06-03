package com.example.facture.services;

import com.example.facture.DTO.CreateModeleFactureRequest;
import com.example.facture.Repository.ModeleFactureRepository;
import com.example.facture.models.ModeleFacture;
import com.example.facture.models.Section;
import com.example.facture.models.SectionContent;
import com.example.facture.security.JwtAuthentication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private static final Logger logger = LoggerFactory.getLogger(ModeleFactureService.class);

    public ModeleFactureService(ModeleFactureRepository modeleFactureRepository, PdfGenerationService pdfGenerationService) {
        this.modeleFactureRepository = modeleFactureRepository;
        this.pdfGenerationService = pdfGenerationService;
    }

    // Helper method to get tenantId from the authenticated user
    private Long getAuthenticatedTenantId() {
        JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getTenantId() == null) {
            logger.error("Authentication or tenantId is missing");
            throw new RuntimeException("Authentication or tenantId is missing");
        }
        return authentication.getTenantId();
    }

    @Transactional
    public ModeleFacture saveModeleFacture(CreateModeleFactureRequest request) {
        Long tenantId = getAuthenticatedTenantId();
        ModeleFacture modeleFacture = new ModeleFacture();
        modeleFacture.setNameModel(request.getName());
        modeleFacture.setCreatedAt(LocalDateTime.now());
        modeleFacture.setUpdatedAt(LocalDateTime.now());
        modeleFacture.setTenantId(tenantId);

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
        ModeleFacture savedModele = modeleFactureRepository.save(modeleFacture);
        logger.info("ModeleFacture saved with ID: {} for tenant: {}", savedModele.getId(), tenantId);
        return savedModele;
    }

    public Optional<ModeleFacture> getModeleFactureById(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        Optional<ModeleFacture> modeleFactureOpt = modeleFactureRepository.findByIdAndTenantId(id, tenantId);
        modeleFactureOpt.ifPresent(modeleFacture -> {
            logger.info("Retrieved ModeleFacture ID: {} for tenant: {}", modeleFacture.getId(), tenantId);
            modeleFacture.getSections().forEach(section ->
                logger.info("Section {}: x={}, y={}", section.getSectionName(), section.getX(), section.getY())
            );
        });
        return modeleFactureOpt;
    }

    public List<ModeleFacture> getAllModeleFactures() {
        Long tenantId = getAuthenticatedTenantId();
        return modeleFactureRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Transactional
    public ModeleFacture updateModeleFacture(Long id, CreateModeleFactureRequest request) {
        Long tenantId = getAuthenticatedTenantId();
        ModeleFacture modeleFacture = modeleFactureRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " + id + " for tenant: " + tenantId));

        modeleFacture.setNameModel(request.getName());
        modeleFacture.setUpdatedAt(LocalDateTime.now());
        modeleFacture.getSections().clear();
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

        return modeleFacture; // Pas besoin de save() grâce à @Transactional
    }

    @Transactional
    public void deleteModeleFacture(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        ModeleFacture modeleFacture = modeleFactureRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " + id + " for tenant: " + tenantId));
        modeleFactureRepository.delete(modeleFacture);
        logger.info("ModeleFacture with ID: {} deleted for tenant: {}", id, tenantId);
    }

    public byte[] generateModeleFacturePdf(Long id, Map<String, String> clientData) {
    Optional<ModeleFacture> modeleFacture = getModeleFactureById(id);
    if (modeleFacture.isPresent()) {
        return pdfGenerationService.generatePdfFromModele(modeleFacture.get(), clientData);
    } else {
        throw new RuntimeException("ModeleFacture with ID " + id + " not found");
    }
}

    public byte[] generateModeleFactureThumbnail(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        logger.info("Generating thumbnail for ModeleFacture ID: {} for tenant: {}", id, tenantId);
        Optional<ModeleFacture> modeleFacture = getModeleFactureById(id);
        if (modeleFacture.isPresent()) {
            return pdfGenerationService.generateThumbnailFromModele(modeleFacture.get(), Collections.emptyMap());
        } else {
            logger.error("ModeleFacture with ID {} not found for tenant: {}", id, tenantId);
            throw new RuntimeException("ModeleFacture with ID " + id + " not found for tenant: " + tenantId);
        }
    }

    public ModeleFacture getModeleFacture(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        return modeleFactureRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " + id + " for tenant: " + tenantId));
    }
}