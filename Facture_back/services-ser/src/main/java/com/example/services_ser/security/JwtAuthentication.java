package com.example.services_ser.security;
import java.util.Collection;
import org.springframework.security.core.Authentication;

public class JwtAuthentication implements Authentication {
    private final String token;
    private boolean authenticated = true;

    public JwtAuthentication(String token) {
        this.token = token;
    }

    @Override
    public Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
        return null; // Vous pouvez ajouter des rôles si nécessaires
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getDetails() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return null; // Vous pouvez retourner l'utilisateur ou son email si nécessaire
    }

    @Override
    public boolean isAuthenticated() {
        return authenticated;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        this.authenticated = isAuthenticated;
    }

    @Override
    public String getName() {
        return null; // Vous pouvez retourner un identifiant unique ou un nom si nécessaire
    }
}
