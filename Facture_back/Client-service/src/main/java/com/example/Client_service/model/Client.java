package com.example.Client_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(
    name = "client",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"clientPhone", "tenantId"}),
        @UniqueConstraint(columnNames = {"rib", "tenantId"})
    }
)
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false)
    private String clientPhone;

    @Column(nullable = false)
    private String clientAddress;

    @Column(nullable = false)
    private String rib;

    @Column(nullable = false)
    private Long tenantId;
}