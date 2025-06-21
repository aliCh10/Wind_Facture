package com.example.Client_service.Controller;

import com.example.Client_service.DTO.ClientDTO;
import com.example.Client_service.Service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/clients")
@Tag(name = "Clients", description = "API pour la gestion des clients")
@SecurityRequirement(name = "BearerAuth")
public class ClientController {

    private final ClientService clientService;

    @Autowired
    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @Operation(summary = "Récupérer tous les clients du tenant authentifié avec pagination")
    @GetMapping
    public ResponseEntity<Page<ClientDTO>> getAllClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(clientService.getAllClients(pageable));
    }

@Operation(summary = "Récupérer un client par ID pour le tenant authentifié")
@GetMapping("/{id}")
public ResponseEntity<ClientDTO> getClientById(@PathVariable Long id) {
    return clientService.getClientById(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
}

    @Operation(summary = "Créer un nouveau client pour le tenant authentifié")
    @PostMapping
    public ResponseEntity<?> createClient(@RequestBody ClientDTO clientDTO) {
        try {
            ClientDTO savedClient = clientService.createClient(clientDTO);
            return ResponseEntity.ok(savedClient);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @Operation(summary = "Mettre à jour un client pour le tenant authentifié")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @RequestBody ClientDTO clientDTO) {
        try {
            ClientDTO updatedClient = clientService.updateClient(id, clientDTO);
            return ResponseEntity.ok(updatedClient);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @Operation(summary = "Supprimer un client pour le tenant authentifié")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        try {
            clientService.deleteClient(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @Operation(summary = "Recherche avancée des clients avec pagination")
    @PostMapping("/search")
    public ResponseEntity<Page<ClientDTO>> searchClients(
            @RequestBody ClientDTO clientDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(clientService.searchClients(clientDTO, pageable));
    }

    // Helper method to create a consistent error response
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}