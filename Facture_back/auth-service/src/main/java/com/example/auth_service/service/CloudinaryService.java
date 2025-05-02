package com.example.auth_service.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
@Service
public class CloudinaryService {
        private final Cloudinary cloudinary;
 public CloudinaryService(@Value("${cloudinary.cloud-name}") String cloudName,
                             @Value("${cloudinary.api-key}") String apiKey,
                             @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    // Method to upload image using MultipartFile
    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Fichier image invalide.");
        }

        // Optional: Validate file size (max 2MB for example)
        if (file.getSize() > 2 * 1024 * 1024) {  // 2MB size limit
            throw new IOException("Le fichier est trop volumineux. Taille maximale autorisée: 2MB.");
        }

        // Specify the Map type for uploadResult
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return (String) uploadResult.get("url");  
    }
    
    
}
