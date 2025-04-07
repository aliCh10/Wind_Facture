package com.example.services_ser.security;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private RestTemplate restTemplate;

    private static final String AUTH_SERVICE_URL = "http://localhost:8090/public/validate"; 

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7); // Extraction du token
        logger.info("Validating token: {}", token);

        try {
            ResponseEntity<String> authResponse = restTemplate.getForEntity(
                AUTH_SERVICE_URL + "?token=" + token, String.class);

            if (authResponse.getStatusCode() == HttpStatus.OK) {
                logger.info("Token validated successfully.");
                // Assurez-vous que l'email de l'utilisateur est présent dans la réponse si vous avez besoin de l'utiliser
                SecurityContextHolder.getContext().setAuthentication(new JwtAuthentication(token));
            } else {
                logger.warn("Invalid token response from Auth service.");
                SecurityContextHolder.clearContext();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }

        } catch (Exception e) {
            logger.error("Error during token validation: {}", e.getMessage());
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token validation failed: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response); // Prochaine étape du filtre
    }
}
