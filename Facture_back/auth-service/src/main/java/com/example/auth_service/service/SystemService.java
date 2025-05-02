package com.example.auth_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.auth_service.Repository.PartnerRepository;
import com.example.auth_service.Repository.UserRepository;
import com.example.auth_service.model.Partner; 
import com.example.auth_service.model.Role;
import com.example.auth_service.model.User;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemService {
    private final PartnerRepository partnerRepository; 
    private final UserRepository userRepository; 
    public List<Partner> getPartnersByRole() {
        return partnerRepository.findByRole(Role.PARTNER); 
    }


    @Transactional
    public String validatePartner(Integer partnerId) {
        // 1. Trouver le partenaire
        Partner partner = partnerRepository.findById(partnerId)
            .orElseThrow(() -> new IllegalArgumentException("Partenaire non trouvé"));
    
        // 2. Vérifier s'il est déjà validé
        if (partner.isValidated()) {
            return "Partenaire déjà validé";
        }
    
        // 3. Mettre à jour le statut du partenaire
        partner.setValidated(true);
        partner.setEnabled(true);
        partnerRepository.save(partner);
    
        // 4. Créer ou METTRE À JOUR l'utilisateur (IGNORER la vérification d'email)
        // User user = new User();        
        // Copier toutes les données du Partner vers le User
        // user.setName(partner.getName());
        // user.setSecondName(partner.getSecondName());
        // user.setEmail(partner.getEmail());
        // user.setPassword(partner.getPassword()); // ⚠️ Doit être crypté (utilisez passwordEncoder!)
        // user.setRole(Role.PARTNER);
        // user.setTel(partner.getTel());
        // user.setEnabled(true);
        // user.setValidated(true);
        // user.setTenantId(partner.getTenantId());
    
        // userRepository.save(user); // Sauvegarde (insert ou update)
    
        return "Partenaire validé et utilisateur synchronisé";
    }
    public String deletePartner(Integer partnerId) {
        Optional<Partner> partnerOpt = partnerRepository.findById(partnerId);
        if (partnerOpt.isEmpty()) {
            return "Partenaire non trouvé";  
        }

        Partner partner = partnerOpt.get();
        
        // Vérifier si le partenaire est validé
        if (partner.isValidated()) { 
            // Supprimer également l'utilisateur correspondant
            userRepository.findByEmail(partner.getEmail()).ifPresent(user -> {
                userRepository.delete(user);
            });
        }
        
        partnerRepository.delete(partner);
        return "Partenaire supprimé avec succès";
    }
    

}
