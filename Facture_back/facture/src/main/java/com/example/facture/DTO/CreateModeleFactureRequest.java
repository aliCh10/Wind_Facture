package com.example.facture.DTO;

import java.util.List;
import java.util.Map;

public class CreateModeleFactureRequest {
    private String name;
    private List<SectionDTO> sections;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<SectionDTO> getSections() {
        return sections;
    }

    public void setSections(List<SectionDTO> sections) {
        this.sections = sections;
    }

    public static class SectionDTO {
        private String sectionName;
        private float x;
        private float y;
        private Map<String, String> styles;
        private SectionContentDTO content;

        public String getSectionName() {
            return sectionName;
        }

        public void setSectionName(String sectionName) {
            this.sectionName = sectionName;
        }

        public float getX() {
            return x;
        }

        public void setX(float x) {
            this.x = x;
        }

        public float getY() {
            return y;
        }

        public void setY(float y) {
            this.y = y;
        }

        public Map<String, String> getStyles() {
            return styles;
        }

        public void setStyles(Map<String, String> styles) {
            this.styles = styles;
        }

        public SectionContentDTO getContent() {
            return content;
        }

        public void setContent(SectionContentDTO content) {
            this.content = content;
        }
    }

    public static class SectionContentDTO {
        private String contentData;

        public String getContentData() {
            return contentData;
        }

        public void setContentData(String contentData) {
            this.contentData = contentData;
        }
    }
}