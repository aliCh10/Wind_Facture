package com.example.facture.services;

import com.example.facture.DTO.CreateFactureRequest;
import com.example.facture.Repository.FactureRepository;
import com.example.facture.models.Facture;
import com.example.facture.models.ModeleFacture;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FactureService {

    private static final Logger logger = LoggerFactory.getLogger(FactureService.class);
    private static final double TAX_RATE = 0.20; 
    private static final String CLIENT_SERVICE = "client-service";
    private static final String SERVICE_SERVICE = "services-ser";
    private static final String AUTH_SERVICE = "auth-service";

    private final FactureRepository factureRepository;
    private final ModeleFactureService modeleFactureService;
    private final PdfGenerationService pdfGenerationService;
    private final RestTemplate restTemplate;
    private final DiscoveryClient discoveryClient;

    public FactureService(
            FactureRepository factureRepository,
            ModeleFactureService modeleFactureService,
            PdfGenerationService pdfGenerationService,
            RestTemplate restTemplate,
            DiscoveryClient discoveryClient) {
        this.factureRepository = factureRepository;
        this.modeleFactureService = modeleFactureService;
        this.pdfGenerationService = pdfGenerationService;
        this.restTemplate = restTemplate;
        this.discoveryClient = discoveryClient;
    }

    @Transactional
    @CircuitBreaker(name = "factureService", fallbackMethod = "createFactureFallback")
    @Retry(name = "factureService")
    public byte[] createFacture(CreateFactureRequest request, String jwtToken) {
        logger.info("Creating facture with modeleFactureId: {}", request.getModeleFactureId());

        // Fetch ModeleFacture
        ModeleFacture modeleFacture = modeleFactureService.getModeleFactureById(request.getModeleFactureId())
                .orElseThrow(() -> new RuntimeException("ModeleFacture with ID " + request.getModeleFactureId() + " not found"));

        // Prepare headers with JWT token
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        // Handle Client
        Map<String, String> clientData = new HashMap<>();
        Long clientId;
        if (request.getClientId() != null) {
            // Fetch existing client
            String clientUrl = getServiceUrl(CLIENT_SERVICE) + "/clients/" + request.getClientId();
            clientId = request.getClientId();
            try {
                Map<String, Object> clientResponse = restTemplate.exchange(
                        clientUrl,
                        HttpMethod.GET,
                        entity,
                        Map.class
                ).getBody();
                if (clientResponse != null) {
                    clientData.put("clientName", (String) clientResponse.get("clientName"));
                    clientData.put("clientPhone", (String) clientResponse.get("clientPhone"));
                    clientData.put("clientAddress", (String) clientResponse.get("clientAddress"));
                    clientData.put("clientRib", (String) clientResponse.get("rib"));
                } else {
                    throw new RuntimeException("Client response is null");
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to fetch client with ID " + request.getClientId() + ": " + e.getMessage());
            }
        } else if (request.getNewClient() != null) {
            // Create new client
            String clientUrl = getServiceUrl(CLIENT_SERVICE) + "/clients";
            HttpEntity<Map<String, String>> createClientEntity = new HttpEntity<>(request.getNewClient(), headers);
            try {
                Map<String, Object> clientResponse = restTemplate.exchange(
                        clientUrl,
                        HttpMethod.POST,
                        createClientEntity,
                        Map.class
                ).getBody();
                if (clientResponse != null) {
                    clientId = ((Number) clientResponse.get("id")).longValue();
                    clientData.put("clientName", (String) clientResponse.get("clientName"));
                    clientData.put("clientPhone", (String) clientResponse.get("clientPhone"));
                    clientData.put("clientAddress", (String) clientResponse.get("clientAddress"));
                    clientData.put("clientRib", (String) clientResponse.get("rib"));
                } else {
                    throw new RuntimeException("Client creation response is null");
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to create client: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("Either clientId or newClient must be provided");
        }

        // Handle Services
        List<Map<String, Object>> services = new ArrayList<>();
        String serviceBaseUrl = getServiceUrl(SERVICE_SERVICE) + "/services";

        // Fetch existing services
        for (Long serviceId : request.getServiceIds()) {
            try {
                Map<String, Object> serviceResponse = restTemplate.exchange(
                        serviceBaseUrl + "/" + serviceId,
                        HttpMethod.GET,
                        entity,
                        Map.class
                ).getBody();
                if (serviceResponse != null) {
                    services.add(serviceResponse);
                }
            } catch (Exception e) {
                logger.warn("Failed to fetch service with ID {}: {}", serviceId, e.getMessage());
            }
        }

        // Create new services
        if (request.getNewServices() != null) {
            for (Map<String, Object> newService : request.getNewServices()) {
                HttpEntity<Map<String, Object>> createServiceEntity = new HttpEntity<>(newService, headers);
                try {
                    Map<String, Object> serviceResponse = restTemplate.exchange(
                            serviceBaseUrl,
                            HttpMethod.POST,
                            createServiceEntity,
                            Map.class
                    ).getBody();
                    if (serviceResponse != null) {
                        services.add(serviceResponse);
                    }
                } catch (Exception e) {
                    logger.warn("Failed to create service: {}", e.getMessage());
                }
            }
        }

        if (services.isEmpty()) {
            throw new RuntimeException("No valid services found or created");
        }

        // Calculate totals
        double subtotal = services.stream()
                .mapToDouble(s -> {
                    Number price = (Number) s.get("servicePrice");
                    Number quantity = (Number) s.get("serviceQuantity");
                    return price.doubleValue() * quantity.intValue();
                })
                .sum();
        double taxes = subtotal * TAX_RATE;
        double totalAmount = subtotal + taxes;

        // Fetch Company Info
        String companyUrl = getServiceUrl(AUTH_SERVICE) + "/public/company-info";
        try {
            Map<String, String> companyInfo = restTemplate.exchange(
                    companyUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class
            ).getBody();
            if (companyInfo != null) {
                clientData.putAll(companyInfo);
            } else {
                throw new RuntimeException("Company info response is null");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch company info: " + e.getMessage());
        }

        // Generate unique facture number
        String factureNumber = generateFactureNumber();

        // Create Facture
        Facture facture = new Facture();
        facture.setFactureNumber(factureNumber);
        facture.setIssueDate(LocalDate.now());
        facture.setDueDate(LocalDate.now().plusDays(30));
        facture.setStatus("PENDING");
        facture.setTaxes(taxes);
        facture.setTotalAmount(totalAmount);
        facture.setModeleFacture(modeleFacture);
        facture.setCreatedAt(LocalDateTime.now());
        facture.setUpdatedAt(LocalDateTime.now());

        // Save Facture
        Facture savedFacture = factureRepository.save(facture);

        // Add service details as a table
        StringBuilder servicesTable = new StringBuilder("<table><thead><tr><th>Ref</th><th>Name</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead><tbody>");
        for (Map<String, Object> service : services) {
            Number price = (Number) service.get("servicePrice");
            Number quantity = (Number) service.get("serviceQuantity");
            double total = price.doubleValue() * quantity.intValue();
            servicesTable.append(String.format(
                    "<tr><td>%s</td><td>%s</td><td>%d</td><td>%.2f</td><td>%.2f</td></tr>",
                    service.get("ref"),
                    service.get("serviceName"),
                    quantity.intValue(),
                    price.doubleValue(),
                    total
            ));
        }
        servicesTable.append("</tbody></table>");
        clientData.put("servicesTable", servicesTable.toString());

        // Add financial and invoice details
        clientData.put("subtotal", String.format("%.2f", subtotal));
        clientData.put("taxes", String.format("%.2f", taxes));
        clientData.put("totalAmount", String.format("%.2f", totalAmount));
        clientData.put("factureNumber", factureNumber);
        clientData.put("issueDate", facture.getIssueDate().toString());
        clientData.put("dueDate", facture.getDueDate().toString());

        // Generate PDF
        byte[] pdfBytes = pdfGenerationService.generatePdfFromModele(modeleFacture, clientData);

        logger.info("Facture created successfully with ID: {}", savedFacture.getId());
        return pdfBytes;
    }

    private String generateFactureNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String candidate = "INV-" + timestamp;
        int suffix = 1;
        while (factureRepository.existsByFactureNumber(candidate)) {
            candidate = "INV-" + timestamp + "-" + suffix++;
        }
        return candidate;
    }

    private String getServiceUrl(String serviceName) {
        return discoveryClient.getInstances(serviceName).stream()
                .findFirst()
                .map(instance -> instance.getUri().toString())
                .orElseThrow(() -> new RuntimeException("Service " + serviceName + " not found"));
    }

    public byte[] createFactureFallback(CreateFactureRequest request, String jwtToken, Throwable t) {
        logger.error("Fallback triggered for createFacture: {}", t.getMessage());
        throw new RuntimeException("Failed to create facture due to service unavailability: " + t.getMessage());
    }
}