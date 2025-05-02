package com.example.facture.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "section")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "position_x", nullable = false)
    private Integer x;

    @Column(name = "position_y", nullable = false)
    private Integer y;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> styles = new HashMap<>();

    @OneToOne(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private SectionContent content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modele_facture_id")
    @JsonIgnore
    private ModeleFacture modeleFacture;

    // Méthode utilitaire pour ajouter un style
    public void addStyle(String key, String value) {
        this.styles.put(key, value);
    }

    // Méthode utilitaire pour obtenir un style
    public String getStyle(String key) {
        return this.styles.get(key);
    }
}