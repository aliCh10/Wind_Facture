package com.example.facture.services;

import com.example.facture.DTO.CreateFactureRequest;
import com.example.facture.DTO.ServiceRequest;
import com.example.facture.models.Facture;
import com.example.facture.models.FactureServicee;
import com.example.facture.models.ModeleFacture;
import com.example.facture.Repository.FactureRepository;
import com.example.facture.Repository.ModeleFactureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FactureService {

    private static final Logger logger = LoggerFactory.getLogger(FactureService.class);
    private final FactureRepository factureRepository;
    private final ModeleFactureRepository modeleFactureRepository;

    public FactureService(
        FactureRepository factureRepository,
        ModeleFactureRepository modeleFactureRepository
    ) {
        this.factureRepository = factureRepository;
        this.modeleFactureRepository = modeleFactureRepository;
    }

    @Transactional
    public Facture createFacture(CreateFactureRequest request, Long tenantId) {
        if (request.getServices() == null || request.getServices().isEmpty()) {
            throw new IllegalArgumentException("At least one service is required");
        }

        ModeleFacture modeleFacture = modeleFactureRepository.findByIdAndTenantId(request.getTemplateId(), tenantId)
                .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " + request.getTemplateId() + " for tenant: " + tenantId));

        Facture facture = new Facture();
        facture.setFactureNumber(generateFactureNumber(tenantId));
        facture.setIssueDate(request.getCreationDate());
        facture.setDueDate(request.getDueDate());
        facture.setClientId(request.getClientId());
        facture.setClientName(request.getClientName());
        facture.setClientPhone(request.getClientPhone()); // Set clientPhone
    facture.setClientAddress(request.getClientAddress()); // Set clientAddress
    facture.setClientRIB(request.getClientRIB()); // Set clientRIB
        facture.setModeleFacture(modeleFacture);
        facture.setCreatedAt(LocalDateTime.now());
        facture.setUpdatedAt(LocalDateTime.now());
        facture.setStatus("Non payée");
        facture.setTenantId(tenantId);
        facture.setFooterText(request.getFooterText());
        List<FactureServicee> factureServices = new ArrayList<>();
        double totalTaxes = 0.0;
        double totalDiscountAmount = 0.0;
        double totalAmount = 0.0;

        for (ServiceRequest serviceRequest : request.getServices()) {
            FactureServicee factureService = new FactureServicee();
            factureService.setFacture(facture);
            factureService.setServiceId(serviceRequest.getServiceId());
            factureService.setServiceName(serviceRequest.getServiceName());
            factureService.setServiceReference(serviceRequest.getServiceReference());
            factureService.setServicePrice(serviceRequest.getServicePrice());
            factureService.setQuantity(serviceRequest.getQuantity());
            factureService.setTva(serviceRequest.getTva());
            factureService.setDiscount(serviceRequest.getDiscount());

            double subtotal = serviceRequest.getServicePrice() * serviceRequest.getQuantity();
            subtotal = Math.round(subtotal * 100.0) / 100.0;
            double discountAmount = subtotal * (serviceRequest.getDiscount() / 100);
            discountAmount = Math.round(discountAmount * 100.0) / 100.0;
            double amountAfterDiscount = subtotal - discountAmount;
            amountAfterDiscount = Math.round(amountAfterDiscount * 100.0) / 100.0;
            double taxes = amountAfterDiscount * (serviceRequest.getTva() / 100);
            taxes = Math.round(taxes * 100.0) / 100.0;
            double serviceTotal = amountAfterDiscount + taxes;
            serviceTotal = Math.round(serviceTotal * 100.0) / 100.0;

            factureService.setSubtotal(subtotal);
            factureService.setTaxes(taxes);
            factureService.setTotalAmount(serviceTotal);

            factureServices.add(factureService);

            totalTaxes += taxes;
            totalDiscountAmount += discountAmount;
            totalAmount += serviceTotal;
        }

        facture.setFactureServices(factureServices);
        facture.setTaxes(totalTaxes);
        facture.setDiscountAmount(totalDiscountAmount);
        facture.setTotalAmount(totalAmount);

        Facture savedFacture = factureRepository.save(facture);
        logger.info("Facture created with ID: {} for tenant: {}", savedFacture.getId(), tenantId);
        return savedFacture;
    }

    public Page<Facture> getFacturesByTenantId(Long tenantId, Pageable pageable) {
        return factureRepository.findByTenantId(tenantId, pageable); // Fixed method name
    }

    private String generateFactureNumber(Long tenantId) {
        long count = factureRepository.countByTenantId(tenantId);
        return String.format("INV-%05d", count + 1);
    }

   public Facture updateFactureModele(Long id, Long templateId, Long tenantId) {
        Facture facture = factureRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Facture not found with id: " + id + " for tenant: " + tenantId));

        ModeleFacture modeleFacture = modeleFactureRepository.findByIdAndTenantId(templateId, tenantId)
                .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " + templateId + " for tenant: " + tenantId));

        facture.setModeleFacture(modeleFacture);
        facture.setUpdatedAt(LocalDateTime.now());

        Facture updatedFacture = factureRepository.save(facture);
        logger.info("Facture modele updated with ID: {} for tenant: {}", updatedFacture.getId(), tenantId);
        return updatedFacture;
    }

    @Transactional
    public void deleteFacture(Long id) {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture not found with id: " + id));
        factureRepository.delete(facture);
        logger.info("Facture deleted with ID: {}", id);
    }

    public Map<String, Double> getRevenueByPeriod(Long tenantId, String periodType, LocalDate startDate, LocalDate endDate) {
        List<Facture> factures = factureRepository.findByTenantIdAndIssueDateBetween(tenantId, startDate, endDate);
        DateTimeFormatter formatter = periodType.equalsIgnoreCase("month") ?
                DateTimeFormatter.ofPattern("yyyy-MM") :
                DateTimeFormatter.ofPattern("yyyy");

        return factures.stream()
                .collect(Collectors.groupingBy(
                        facture -> facture.getIssueDate().format(formatter),
                        Collectors.summingDouble(Facture::getTotalAmount)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    public List<Map<String, Object>> getTopClientsByRevenue(Long tenantId, int limit) {
        // Use paginated query to fetch all factures
        Page<Facture> facturePage = factureRepository.findByTenantId(tenantId, PageRequest.of(0, Integer.MAX_VALUE));
        return facturePage.getContent().stream()
                .collect(Collectors.groupingBy(
                        Facture::getClientId,
                        Collectors.summingDouble(Facture::getTotalAmount)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("clientId", entry.getKey());
                    // Fetch clientName from the first facture with this clientId
                    String clientName = facturePage.getContent().stream()
                            .filter(f -> f.getClientId().equals(entry.getKey()))
                            .findFirst()
                            .map(Facture::getClientName)
                            .orElse("Unknown Client");
                    result.put("clientName", clientName);
                    result.put("totalRevenue", Math.round(entry.getValue() * 100.0) / 100.0);
                    return result;
                })
                .collect(Collectors.toList());
    }
    public List<Map<String, Object>> getTopServicesByRevenue(Long tenantId, int limit) {
        // Use paginated query to fetch all factures
        Page<Facture> facturePage = factureRepository.findByTenantId(tenantId, PageRequest.of(0, Integer.MAX_VALUE));
        return facturePage.getContent().stream()
                .flatMap(facture -> facture.getFactureServices().stream())
                .collect(Collectors.groupingBy(
                        FactureServicee::getServiceId,
                        Collectors.summingDouble(FactureServicee::getTotalAmount)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("serviceId", entry.getKey());
                    String serviceName = facturePage.getContent().stream()
                            .flatMap(f -> f.getFactureServices().stream())
                            .filter(fs -> fs.getServiceId().equals(entry.getKey()))
                            .findFirst()
                            .map(FactureServicee::getServiceName)
                            .orElse("Unknown");
                    result.put("serviceName", serviceName);
                    result.put("totalRevenue", Math.round(entry.getValue() * 100.0) / 100.0);
                    return result;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopModelesByUsage(Long tenantId, int limit) {
        // Use paginated query to fetch all factures
        Page<Facture> facturePage = factureRepository.findByTenantId(tenantId, PageRequest.of(0, Integer.MAX_VALUE));
        return facturePage.getContent().stream()
                .filter(facture -> facture.getModeleFacture() != null)
                .collect(Collectors.groupingBy(
                        facture -> facture.getModeleFacture().getId(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    ModeleFacture modele = modeleFactureRepository.findByIdAndTenantId(entry.getKey(), tenantId)
                            .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " +  entry.getKey()));
                    result.put("modeleId", entry.getKey());
                    result.put("modeleName", modele.getNameModel() != null ? modele.getNameModel() : "Unknown Template");
                    result.put("usageCount", entry.getValue());
                    return result;
                })
                .collect(Collectors.toList());
    }
}