package com.example.Client_service.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.Client_service.Repository.ClientRepository;
import com.example.Client_service.model.Client;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/clients")
@Tag(name = "Clients", description = "API pour la gestion des clients")
@SecurityRequirement(name = "BearerAuth") 
@PreAuthorize("hasAuthority('ROLE_PARTNER')")

public class ClientController {
    
   @Autowired
    private ClientRepository clientRepository;

    @Operation(summary = "Récupérer tous les clients")
    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        return ResponseEntity.ok(clientRepository.findAll());
    }

    @Operation(summary = "Récupérer un client par ID")
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Créer un nouveau client")
    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        Client savedClient = clientRepository.save(client);
        return ResponseEntity.ok(savedClient);
    }

    @Operation(summary = "Mettre à jour un client")
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client clientDetails) {
        return clientRepository.findById(id)
                .map(client -> {
                    client.setClientName(clientDetails.getClientName());
                    client.setClientAddress(clientDetails.getClientAddress());
                    client.setClientPhone(clientDetails.getClientPhone());
                    client.setRib(clientDetails.getRib());
                    return ResponseEntity.ok(client);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Supprimer un client")
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        if (!clientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clientRepository.deleteById(id);
        return ResponseEntity.ok().build(); 
    }
}
