package com.example.facture.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "section_content")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SectionContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "section_id", nullable = false)
    @JsonBackReference
    private Section section;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contentData;
}