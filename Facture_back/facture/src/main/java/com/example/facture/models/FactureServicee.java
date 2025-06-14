package com.example.facture.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "facture_services")
public class FactureServicee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "facture_id", nullable = false)
    @JsonBackReference
    private Facture facture;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(name = "service_name")
    private String serviceName;

    @Column(name = "service_reference")
    private String serviceReference;

    @Column(name = "service_price", nullable = false)
    private double servicePrice;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "tva", nullable = false)
    private double tva;

    @Column(name = "discount", nullable = false)
    private double discount;

    @Column(name = "subtotal", nullable = false)
    private double subtotal;

    @Column(name = "taxes", nullable = false)
    private double taxes;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;
}