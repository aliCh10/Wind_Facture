package com.example.Client_service.Service;

import com.example.Client_service.model.Client;
import com.example.Client_service.DTO.ClientDTO;
import com.example.Client_service.Repository.ClientRepository;
import com.example.Client_service.security.JwtAuthentication;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
@Service
@AllArgsConstructor
public class ClientService {

   private final ClientRepository clientRepository;

// Helper method to get tenantId from the authenticated user
private Long getAuthenticatedTenantId() {
    JwtAuthentication authentication = (JwtAuthentication) SecurityContextHolder.getContext().getAuthentication();
    return authentication.getTenantId();
}

// Convert Client to ClientDTO
private ClientDTO toDTO(Client client) {
    ClientDTO dto = new ClientDTO();
    dto.setId(client.getId());
    dto.setClientName(client.getClientName());
    dto.setClientPhone(client.getClientPhone());
    dto.setClientAddress(client.getClientAddress());
    dto.setRib(client.getRib());
    return dto;
}

// Convert ClientDTO to Client
private Client toEntity(ClientDTO dto) {
    Client client = new Client();
    client.setId(dto.getId());
    client.setClientName(dto.getClientName());
    client.setClientPhone(dto.getClientPhone());
    client.setClientAddress(dto.getClientAddress());
    client.setRib(dto.getRib());
    return client;
}

// Récupérer tous les clients pour le tenant authentifié
public List<ClientDTO> getAllClients() {
    Long tenantId = getAuthenticatedTenantId();
    return clientRepository.findByTenantId(tenantId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
}

// Récupérer un client par ID pour le tenant authentifié
public Optional<ClientDTO> getClientById(Long id) {
    Long tenantId = getAuthenticatedTenantId();
    return clientRepository.findById(id)
            .filter(client -> client.getTenantId().equals(tenantId))
            .map(this::toDTO);
}

// Créer un nouveau client avec le tenantId authentifié
@Transactional
public ClientDTO createClient(ClientDTO clientDTO) {
    Long tenantId = getAuthenticatedTenantId();
    Client client = toEntity(clientDTO);
    client.setId(null); // Ignorer l'id fourni dans le DTO
    client.setTenantId(tenantId);
    Client savedClient = clientRepository.save(client);
    return toDTO(savedClient);
}

// Mettre à jour un client pour le tenant authentifié
@Transactional
public ClientDTO updateClient(Long id, ClientDTO clientDTO) {
    Long tenantId = getAuthenticatedTenantId();
    Client client = clientRepository.findById(id)
            .filter(c -> c.getTenantId().equals(tenantId))
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + id + " for tenant: " + tenantId));

    client.setClientName(clientDTO.getClientName());
    client.setClientPhone(clientDTO.getClientPhone());
    client.setClientAddress(clientDTO.getClientAddress());
    client.setRib(clientDTO.getRib());

    return toDTO(client); // Pas besoin de save() grâce à @Transactional
}

// Supprimer un client pour le tenant authentifié
@Transactional
public void deleteClient(Long id) {
    Long tenantId = getAuthenticatedTenantId();
    Client client = clientRepository.findById(id)
            .filter(c -> c.getTenantId().equals(tenantId))
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + id + " for tenant: " + tenantId));
    clientRepository.delete(client);
}
public List<ClientDTO> searchClients(ClientDTO clientDTO) {
    Long tenantId = getAuthenticatedTenantId();
    
    Specification<Client> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();
        
        // Toujours filtrer par tenantId
        predicates.add(cb.equal(root.get("tenantId"), tenantId));
        
        // Ajouter les critères de recherche si fournis
        if (clientDTO.getClientName() != null && !clientDTO.getClientName().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("clientName")), 
                          "%" + clientDTO.getClientName().toLowerCase() + "%"));
        }
        if (clientDTO.getClientPhone() != null && !clientDTO.getClientPhone().isEmpty()) {
            predicates.add(cb.like(root.get("clientPhone"), 
                          "%" + clientDTO.getClientPhone() + "%"));
        }
        if (clientDTO.getClientAddress() != null && !clientDTO.getClientAddress().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("clientAddress")), 
                          "%" + clientDTO.getClientAddress().toLowerCase() + "%"));
        }
        if (clientDTO.getRib() != null && !clientDTO.getRib().isEmpty()) {
            predicates.add(cb.like(root.get("rib"), 
                          "%" + clientDTO.getRib() + "%"));
        }
        
        return cb.and(predicates.toArray(new Predicate[0]));
    };
    
    return clientRepository.findAll(spec)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
}
}