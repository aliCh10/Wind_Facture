package com.example.facture.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor

@Table(name = "factures")
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "facture_number", nullable = false, unique = true)
    private String factureNumber;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "taxes", nullable = false)
    private double taxes;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;

    @Column(name = "discount_amount", nullable = false)
    private double discountAmount;

    @Column(name = "client_id", nullable = false)
    private Long clientId;
    @Column(name = "tenant_id", nullable = false) // Add tenantId field
    private Long tenantId;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<FactureServicee> factureServices = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "modele_facture_id", nullable = false)
    private ModeleFacture modeleFacture;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    
}