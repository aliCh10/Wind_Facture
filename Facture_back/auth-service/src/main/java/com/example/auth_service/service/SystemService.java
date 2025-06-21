package com.example.auth_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public Page<Partner> getPartnersByRole(String name, Pageable pageable) {
        if (name != null && !name.trim().isEmpty()) {
            return partnerRepository.findByRoleAndNameContainingIgnoreCase(Role.PARTNER, name, pageable);
        }
        return partnerRepository.findByRole(Role.PARTNER, pageable);
    }

    @Transactional
    public String validatePartner(Integer partnerId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalArgumentException("Partenaire non trouvé"));

        if (partner.isValidated()) {
            return "Partenaire déjà validé";
        }

        partner.setValidated(true);
        partner.setEnabled(true);
        partnerRepository.save(partner);

        return "Partenaire validé et utilisateur synchronisé";
    }

    @Transactional
    public String deletePartner(Integer partnerId) {
        Optional<Partner> partnerOpt = partnerRepository.findById(partnerId);
        if (partnerOpt.isEmpty()) {
            return "Partenaire non trouvé";
        }

        Partner partner = partnerOpt.get();
        if (partner.isValidated()) {
            userRepository.findByEmail(partner.getEmail()).ifPresent(userRepository::delete);
        }

        partnerRepository.delete(partner);
        return "Partenaire supprimé avec succès";
    }
}