package com.example.auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.RequestBody;
@Configuration

public class SwaggerConfig {
      @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Facture")
                        .version("1.0")
                        .description("Documentation de l'API de gestion des factures"))
                .path("/register", new PathItem()
                        .post(new Operation()
                                .requestBody(new RequestBody()
                                        .content(new Content()
                                                .addMediaType("multipart/form-data", new MediaType()
                                                        .schema(new Schema().addProperties("logo", new Schema().type("file").format("binary"))))))));
    }
    
}
