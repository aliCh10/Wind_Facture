package com.example.auth_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.auth_service.Repository.PartnerRepository;
import com.example.auth_service.Repository.UserRepository;
import com.example.auth_service.model.Partner; 
import com.example.auth_service.model.Role;
import com.example.auth_service.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemService {
    private final PartnerRepository partnerRepository; 
    private final UserRepository userRepository; 
    public List<Partner> getPartnersByRole() {
        return partnerRepository.findByRole(Role.PARTNER); 
    }

    public String validatePartner(Integer partnerId) {
        Optional<Partner> partnerOpt = partnerRepository.findById(partnerId);
        if (partnerOpt.isEmpty()) {
            return "Partenaire non trouvé";  
        }
    
        Partner partner = partnerOpt.get();
    
        if (partner.isValidated()) {
            return "Partenaire déjà validé"; 
        }
    
        partner.setValidated(true);
        partnerRepository.save(partner); 
    
        User newUser = User.builder()
            .name(partner.getName())
            .secondName(partner.getSecondName())
            .email(partner.getEmail())
            .password(partner.getPassword())
            .role(Role.PARTNER) 
            .tel(partner.getTel())
            .enabled(true) 
            .validated(true)
            .tenantId(partner.getTenantId()) 
            .build();
    
        userRepository.save(newUser);
    
        partnerRepository.delete(partner);
    
        return "Partenaire validé et déplacé vers la table Users avec succès"; 
    }    public String deletePartner(Integer partnerId) {
        Optional<Partner> partnerOpt = partnerRepository.findById(partnerId);
        if (partnerOpt.isEmpty()) {
            return "Partenaire non trouvé";  
        }

        Partner partner = partnerOpt.get();
        
    
        if (partner.isValidated()) { 
            return "Ce partenaire a déjà été validé et transféré vers la table Users. Il ne peut pas être supprimé.";
        }
        partnerRepository.delete(partner);
        return "Partenaire supprimé avec succès";
    }
    
    

}
