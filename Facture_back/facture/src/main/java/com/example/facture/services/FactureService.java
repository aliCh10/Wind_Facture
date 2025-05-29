package com.example.facture.services;

import com.example.facture.DTO.CreateFactureRequest;
import com.example.facture.DTO.ServiceRequest;
import com.example.facture.models.Facture;
import com.example.facture.models.FactureServicee; // Correct import
import com.example.facture.models.ModeleFacture;
import com.example.facture.Repository.FactureRepository;
import com.example.facture.Repository.ModeleFactureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
    public Facture createFacture(CreateFactureRequest request) {
        if (request.getServices() == null || request.getServices().isEmpty()) {
            throw new IllegalArgumentException("At least one service is required");
        }

        ModeleFacture modeleFacture = modeleFactureRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new RuntimeException("ModeleFacture not found with id: " + request.getTemplateId()));

        Facture facture = new Facture();
        facture.setFactureNumber(generateFactureNumber());
        facture.setIssueDate(request.getCreationDate());
        facture.setDueDate(request.getDueDate());
        facture.setClientId(request.getClientId());
        facture.setModeleFacture(modeleFacture);
        facture.setCreatedAt(LocalDateTime.now());
        facture.setUpdatedAt(LocalDateTime.now());
        facture.setStatus("pending");

        List<FactureServicee> factureServices = new ArrayList<>();
        double totalTaxes = 0.0;
        double totalDiscountAmount = 0.0;
        double totalAmount = 0.0;

        // Process each service
        for (ServiceRequest serviceRequest : request.getServices()) {
            FactureServicee factureService = new FactureServicee();
            factureService.setFacture(facture);
            factureService.setServiceId(serviceRequest.getServiceId());
            factureService.setServicePrice(serviceRequest.getServicePrice());
            factureService.setQuantity(serviceRequest.getQuantity());
            factureService.setTva(serviceRequest.getTva());
            factureService.setDiscount(serviceRequest.getDiscount());

            // Calculate amounts for this service
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

            // Aggregate totals
            totalTaxes += taxes;
            totalDiscountAmount += discountAmount;
            totalAmount += serviceTotal;
        }

        facture.setFactureServices(factureServices);
        facture.setTaxes(totalTaxes);
        facture.setDiscountAmount(totalDiscountAmount);
        facture.setTotalAmount(totalAmount);

        // Save the facture (this will also save factureServices due to cascade)
        Facture savedFacture = factureRepository.save(facture);
        return savedFacture;
    }

    private String generateFactureNumber() {
        return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}