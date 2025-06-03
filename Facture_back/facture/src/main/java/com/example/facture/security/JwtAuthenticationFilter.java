package com.example.facture.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
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
        logger.info("Request URL: {}, Authorization header: {}", request.getRequestURI(), header);

        if (header == null || !header.startsWith("Bearer ")) {
            logger.debug("No Bearer token found in Authorization header");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        logger.info("Validating token: {}", token);
        logger.info("Auth service URL configured: {}", authServiceUrl);

        try {
            logger.debug("Calling auth service at: {}", authServiceUrl + "?token=" + token);
            ResponseEntity<String> authResponse = restTemplate.getForEntity(
                    authServiceUrl + "?token=" + token, String.class);
            logger.info("Auth service response status: {}, body: {}", authResponse.getStatusCode(), authResponse.getBody());

            if (authResponse.getStatusCode() == HttpStatus.OK) {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> responseMap;
                try {
                    responseMap = mapper.readValue(authResponse.getBody(), Map.class);
                    logger.debug("Parsed response map: {}", responseMap);
                } catch (Exception e) {
                    logger.error("Failed to parse JSON response: {}", authResponse.getBody(), e);
                    throw new IllegalStateException("Invalid JSON response from auth service", e);
                }

                String message = (String) responseMap.get("message");
                Object tenantIdObj = responseMap.get("tenantId");
                List<String> roles = (List<String>) responseMap.get("roles");

                logger.info("Parsed message: {}, tenantId: {}, roles: {}", message, tenantIdObj, roles);

                if (!"Token is valid".equals(message)) {
                    throw new IllegalStateException("Unexpected validation message: " + message);
                }

                if (tenantIdObj == null) {
                    throw new IllegalStateException("tenantId is missing in response");
                }

                Long tenantId;
                if (tenantIdObj instanceof Number) {
                    tenantId = ((Number) tenantIdObj).longValue();
                } else if (tenantIdObj instanceof String) {
                    try {
                        tenantId = Long.parseLong((String) tenantIdObj);
                    } catch (NumberFormatException e) {
                        throw new IllegalStateException("Invalid tenantId format: " + tenantIdObj, e);
                    }
                } else {
                    throw new IllegalStateException("Invalid tenantId type: " + tenantIdObj.getClass());
                }

                if (roles == null || roles.isEmpty()) {
                    throw new IllegalStateException("Roles are missing or empty in response");
                }

                JwtAuthentication authentication = new JwtAuthentication(token);
                authentication.setTenantId(tenantId);
                authentication.setRoles(roles);
                authentication.setAuthenticated(true);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Authentication set for tenantId: {}, roles: {}", tenantId, roles);
                logger.debug("SecurityContext authentication: {}", SecurityContextHolder.getContext().getAuthentication());
            } else {
                logger.warn("Invalid token response: {}", authResponse.getStatusCode());
                SecurityContextHolder.clearContext();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token response: " + authResponse.getStatusCode());
                return;
            }
        } catch (RestClientException e) {
            logger.error("Network error during token validation: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Network error: " + e.getMessage());
            return;
        } catch (Exception e) {
            logger.error("Error during token validation: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token validation failed: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }
}