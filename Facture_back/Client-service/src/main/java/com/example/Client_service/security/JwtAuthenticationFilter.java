package com.example.Client_service.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private RestTemplate restTemplate;

    @Value("${auth.service.url:http://localhost:8090/public/validate}")
    private String authServiceUrl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            logger.debug("No Bearer token found in Authorization header");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        logger.info("Validating token: {}", token);

        try {
            ResponseEntity<String> authResponse = restTemplate.getForEntity(
                    authServiceUrl + "?token=" + token, String.class);

            if (authResponse.getStatusCode() == HttpStatus.OK) {
                // Parse the response to extract tenantId
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> responseMap = mapper.readValue(authResponse.getBody(), Map.class);
                String message = (String) responseMap.get("message");
                Long tenantId = responseMap.get("tenantId") instanceof Number
                        ? ((Number) responseMap.get("tenantId")).longValue()
                        : Long.parseLong((String) responseMap.get("tenantId"));

                if (!"Token is valid".equals(message)) {
                    throw new IllegalStateException("Unexpected validation message: " + message);
                }

                // Create authentication with tenantId
                JwtAuthentication authentication = new JwtAuthentication(token);
                authentication.setTenantId(tenantId);

                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Token validated successfully for tenant: {}", tenantId);
            } else {
                logger.warn("Invalid token response from Auth service: {}", authResponse.getStatusCode());
                SecurityContextHolder.clearContext();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        } catch (Exception e) {
            logger.error("Error during token validation: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token validation failed: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }
}