package com.example.Client_service.Service;
import com.example.Client_service.model.Client;

import lombok.AllArgsConstructor;

import com.example.Client_service.Repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

  

    // Récupérer tous les clients
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    // Récupérer un client par ID
    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    // Créer un nouveau client
    public Client createClient(Client client) {
        return clientRepository.save(client);
    }

    // Mettre à jour un client
    @Transactional
    public Client updateClient(Long id, Client clientDetails) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        client.setClientName(clientDetails.getClientName());
        client.setClientAddress(clientDetails.getClientAddress());
        client.setClientPhone(clientDetails.getClientPhone());
        client.setRib(clientDetails.getRib());

        return client; // Pas besoin de save() grâce à @Transactional
    }

    // Supprimer un client
    @Transactional
    public void deleteClient(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }
}