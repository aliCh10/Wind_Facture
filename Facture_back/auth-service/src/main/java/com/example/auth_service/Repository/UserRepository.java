package com.example.auth_service.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auth_service.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    User findByemail(String email);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(com.example.auth_service.model.Role user);
    
}
