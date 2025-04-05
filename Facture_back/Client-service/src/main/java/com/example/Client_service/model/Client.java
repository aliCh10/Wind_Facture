package com.example.Client_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Client {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false, unique = true)
    private String clientPhone;

    @Column(nullable = false)
    private String clientAddress;

    @Column(nullable = false, unique = true)
    private String rib;
}
