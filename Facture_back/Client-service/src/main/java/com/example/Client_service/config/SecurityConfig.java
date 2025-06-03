package com.example.Client_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.Client_service.security.JwtAuthenticationFilter;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // Désactive CSRF (pas nécessaire pour une API REST avec JWT)
            .cors().and() // Active la gestion CORS
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/clients/**").authenticated() // L'utilisateur doit être authentifié
                .requestMatchers("/clients/**").hasAnyAuthority("ROLE_PARTNER","ROLE_EMPLOYE") // L'utilisateur doit avoir l'autorité ROLE_PARTNER
                .anyRequest().permitAll() // Autorise les autres routes sans authentification
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class); // Ajout du filtre JWT
        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200")); // Autorise votre frontend Angular
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Méthodes HTTP autorisées
        configuration.setAllowedHeaders(Arrays.asList("*")); // Autorise tous les headers
        configuration.setAllowCredentials(true); // Autorise les cookies/credentials (nécessaire pour JWT si envoyé via cookies)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Applique la config CORS à toutes les routes
        return source;
    }
}