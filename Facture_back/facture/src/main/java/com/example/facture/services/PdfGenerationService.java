package com.example.facture.services;

import com.example.facture.models.ModeleFacture;
import com.example.facture.models.Section;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);

    public byte[] generatePdfFromModele(ModeleFacture modeleFacture) {
        logger.info("Starting PDF generation for model: {}", modeleFacture.getNameModel());
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            pdf.setDefaultPageSize(PageSize.A4);

            // Conversion factor (1px = 0.75pt in CSS standard)
            final float pxToPt = 0.75f;
            final float a4Width = 595; // pt
            final float a4Height = 842; // pt

            StringBuilder htmlContent = new StringBuilder();
            htmlContent.append("<html><head><style>");
            htmlContent.append("@page { size: A4; margin: 0; }");
            htmlContent.append("body { margin: 0; padding: 0; position: relative; ");
            htmlContent.append("width: ").append(a4Width).append("pt; ");
            htmlContent.append("height: ").append(a4Height).append("pt; ");
            htmlContent.append("background-color: #f0f0f0; }");
            htmlContent.append(".container { position: relative; width: ").append(a4Width).append("pt; height: ").append(a4Height).append("pt; }");
            htmlContent.append(".section { position: absolute; border: 1px dashed #ccc; box-sizing: border-box; }");
            htmlContent.append("</style></head><body>");
            htmlContent.append("<div class='container'>");

            List<Section> sections = modeleFacture.getSections();
            logger.info("Processing {} sections", sections.size());

            for (Section section : sections) {
                logger.info("Processing section: {}", section.getSectionName());
                
                // Récupérer les positions brutes
                float rawX = section.getX();
                float rawY = section.getY();
                logger.info("Raw position for {}: x={}, y={}", section.getSectionName(), rawX, rawY);

                // Convertir les positions de pixels en points
                float xPt = rawX * pxToPt;
                float yPt = rawY * pxToPt;

                // Vérifier les limites de la page
                xPt = Math.max(0, Math.min(xPt, a4Width));
                yPt = Math.max(0, Math.min(yPt, a4Height));
                
                logger.info("Converted position for {}: X={}pt, Y={}pt", section.getSectionName(), xPt, yPt);

                // Construire les styles CSS
                StringBuilder styleBuilder = new StringBuilder();
                styleBuilder.append(String.format("left: %fpt; top: %fpt; ", xPt, yPt));
                
                if (section.getStyles() != null) {
                    logger.info("Styles for section {}: {}", section.getSectionName(), section.getStyles());
                    section.getStyles().forEach((key, value) -> {
                        if (value != null && !value.isEmpty()) {
                            if (value.endsWith("px")) {
                                try {
                                    float pxVal = Float.parseFloat(value.substring(0, value.length() - 2));
                                    float ptVal = pxVal * pxToPt;
                                    styleBuilder.append(key).append(": ").append(ptVal).append("pt; ");
                                } catch (NumberFormatException e) {
                                    styleBuilder.append(key).append(": ").append(value).append("; ");
                                }
                            } else {
                                styleBuilder.append(key).append(": ").append(value).append("; ");
                            }
                        }
                    });
                }

                logger.info("CSS styles for section {}: {}", section.getSectionName(), styleBuilder.toString());

                // Récupérer le contenu HTML
                String contentData = section.getContent() != null ? section.getContent().getContentData() : "";
                if (contentData.isEmpty()) {
                    logger.warn("Section {} has empty content, using placeholder.", section.getSectionName());
                    contentData = "<div style='width: 100pt; height: 100pt; background-color: #ddd;'>" + section.getSectionName() + "</div>";
                }
                logger.info("Section {} content: {}", section.getSectionName(), contentData);
                
                // Ajouter la section au HTML
                htmlContent.append(String.format(
                    "<div class='section' style='%s'>%s</div>",
                    styleBuilder.toString(),
                    contentData
                ));
            }

            htmlContent.append("</div></body></html>");
            logger.info("Generated HTML: {}", htmlContent.toString());
            
            ConverterProperties properties = new ConverterProperties();
            properties.setBaseUri("");
            
            HtmlConverter.convertToPdf(htmlContent.toString(), pdf, properties);
            pdf.close();
            
            logger.info("PDF generated successfully ({} bytes)", baos.size());
            return baos.toByteArray();
        } catch (Exception e) {
            logger.error("PDF generation error", e);
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}