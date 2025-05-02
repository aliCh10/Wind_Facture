package com.example.facture.DTO;

import java.util.List;

import com.example.facture.models.Section;

public class CreateModeleFactureRequest {
    private String name;
    private List<Section> sections;

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Section> getSections() {
        return sections;
    }

    public void setSections(List<Section> sections) {
        this.sections = sections;
    }
    
}
