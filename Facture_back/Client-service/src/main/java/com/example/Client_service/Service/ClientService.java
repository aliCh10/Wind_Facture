package com.example.Client_service.Service;

import com.example.Client_service.model.Client;
import com.example.Client_service.Repository.ClientRepository;
import com.example.Client_service.security.JwtAuthentication;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // Récupérer tous les clients pour le tenant authentifié
    public List<Client> getAllClients() {
        Long tenantId = getAuthenticatedTenantId();
        return clientRepository.findByTenantId(tenantId);
    }

    // Récupérer un client par ID pour le tenant authentifié
    public Optional<Client> getClientById(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        return clientRepository.findById(id)
                .filter(client -> client.getTenantId().equals(tenantId));
    }

    // Créer un nouveau client avec le tenantId authentifié
    public Client createClient(Client client) {
        Long tenantId = getAuthenticatedTenantId();
        client.setTenantId(tenantId);
        return clientRepository.save(client);
    }

    // Mettre à jour un client pour le tenant authentifié
    @Transactional
    public Client updateClient(Long id, Client clientDetails) {
        Long tenantId = getAuthenticatedTenantId();
        Client client = clientRepository.findById(id)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id + " for tenant: " + tenantId));

        client.setClientName(clientDetails.getClientName());
        client.setClientAddress(clientDetails.getClientAddress());
        client.setClientPhone(clientDetails.getClientPhone());
        client.setRib(clientDetails.getRib());

        return client; // Pas besoin de save() grâce à @Transactional
    }

    // Supprimer un client pour le tenant authentifié
    @Transactional
    public void deleteClient(Long id) {
        Long tenantId = getAuthenticatedTenantId();
        Client client = clientRepository.findById(id)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id + " for tenant: " + tenantId));
        clientRepository.deleteById(id);
    }
}