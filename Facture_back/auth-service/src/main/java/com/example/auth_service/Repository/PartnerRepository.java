package com.example.auth_service.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.auth_service.model.Partner;
import com.example.auth_service.model.Role;
@Repository

public interface PartnerRepository  extends JpaRepository<Partner, Integer> {
    Optional<Partner> findByEmail(String email);

    List<Partner> findByRole(Role partner);
    Optional<Partner> findById(Long id);


    
}
