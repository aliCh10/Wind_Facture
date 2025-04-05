package com.example.Client_service.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Client_service.model.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {    
    
}
