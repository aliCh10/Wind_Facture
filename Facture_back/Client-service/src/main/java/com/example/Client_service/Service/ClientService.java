package com.example.Client_service.Service;

import com.example.Client_service.model.Client;
import com.example.Client_service.DTO.ClientDTO;
import com.example.Client_service.Repository.ClientRepository;
import com.example.Client_service.security.JwtAuthentication;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    // Retrieve paginated clients for the authenticated tenant
    public Page<ClientDTO> getAllClients(Pageable pageable) {
        Long tenantId = getAuthenticatedTenantId();
        return clientRepository.findByTenantId(tenantId, pageable)
                .map(this::toDTO);
    }

    // Retrieve a client by ID for the authenticated tenant
    public Optional<ClientDTO> getClientById(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        return clientRepository.findById(id)
                .filter(client -> client.getTenantId().equals(tenantId))
                .map(this::toDTO);
    }

    // Create a new client with the authenticated tenantId
    @Transactional
    public ClientDTO createClient(ClientDTO clientDTO) {
        Long tenantId = getAuthenticatedTenantId();

        // Validate uniqueness of clientPhone and rib for the tenant
        if (clientRepository.findByClientPhoneAndTenantId(clientDTO.getClientPhone(), tenantId).isPresent()) {
            throw new RuntimeException("Client phone " + clientDTO.getClientPhone() + " already exists for tenant: " + tenantId);
        }
        if (clientRepository.findByRibAndTenantId(clientDTO.getRib(), tenantId).isPresent()) {
            throw new RuntimeException("RIB " + clientDTO.getRib() + " already exists for tenant: " + tenantId);
        }

        Client client = toEntity(clientDTO);
        client.setId(null); // Ignore the ID provided in the DTO
        client.setTenantId(tenantId);
        Client savedClient = clientRepository.save(client);
        return toDTO(savedClient);
    }

    // Update a client for the authenticated tenant
   // Update a client for the authenticated tenant
@Transactional
public ClientDTO updateClient(Long id, ClientDTO clientDTO) {
    Long tenantId = getAuthenticatedTenantId();
    Client client = clientRepository.findById(id)
            .filter(c -> c.getTenantId().equals(tenantId))
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + id + " for tenant: " + tenantId));

    // Validate uniqueness of clientPhone and rib for the tenant (excluding the current client)
    Optional<Client> existingPhoneClient = clientRepository.findByClientPhoneAndTenantId(clientDTO.getClientPhone(), tenantId);
    if (existingPhoneClient.isPresent() && !existingPhoneClient.get().getId().equals(id)) {
        throw new RuntimeException("Client phone " + clientDTO.getClientPhone() + " already exists for another client in tenant: " + tenantId);
    }
    Optional<Client> existingRibClient = clientRepository.findByRibAndTenantId(clientDTO.getRib(), tenantId);
    if (existingRibClient.isPresent() && !existingRibClient.get().getId().equals(id)) {
        throw new RuntimeException("RIB " + clientDTO.getRib() + " already exists for another client in tenant: " + tenantId);
    }

    client.setClientName(clientDTO.getClientName());
    client.setClientPhone(clientDTO.getClientPhone());
    client.setClientAddress(clientDTO.getClientAddress());
    client.setRib(clientDTO.getRib());

    return toDTO(client); // No need to save() due to @Transactional
}

    // Search clients with pagination, focusing on name filtering
    public Page<ClientDTO> searchClients(ClientDTO clientDTO, Pageable pageable) {
        Long tenantId = getAuthenticatedTenantId();

        Specification<Client> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by tenantId
            predicates.add(cb.equal(root.get("tenantId"), tenantId));

            // Filter by clientName if provided
            if (clientDTO.getClientName() != null && !clientDTO.getClientName().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("clientName")), 
                        "%" + clientDTO.getClientName().trim().toLowerCase() + "%"));
            }

            // Optionally include other filters
            if (clientDTO.getClientPhone() != null && !clientDTO.getClientPhone().trim().isEmpty()) {
                predicates.add(cb.like(root.get("clientPhone"), 
                        "%" + clientDTO.getClientPhone().trim() + "%"));
            }
            if (clientDTO.getClientAddress() != null && !clientDTO.getClientAddress().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("clientAddress")), 
                        "%" + clientDTO.getClientAddress().trim().toLowerCase() + "%"));
            }
            if (clientDTO.getRib() != null && !clientDTO.getRib().trim().isEmpty()) {
                predicates.add(cb.like(root.get("rib"), 
                        "%" + clientDTO.getRib().trim() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return clientRepository.findAll(spec, pageable).map(this::toDTO);
    }
    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}   