package com.example.facture.services;

import com.example.facture.models.ModeleFacture;
import com.example.facture.models.Section;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.kernel.pdf.xobject.PdfImageXObject;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class PdfGenerationService {
    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);

    public byte[] generatePdfFromModele(ModeleFacture modele) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            pdf.setDefaultPageSize(PageSize.A4);
            PdfCanvas canvas = new PdfCanvas(pdf.addNewPage());
            float pxToPt = 0.75f;
            float pageHeight = PageSize.A4.getHeight();
            float pageWidth = PageSize.A4.getWidth();

            for (Section section : modele.getSections()) {
                float x = clamp(section.getX() * pxToPt, 0, pageWidth);
                float y = clamp(pageHeight - (section.getY() * pxToPt), 0, pageHeight);
                Map<String, String> styles = section.getStyles() != null ? section.getStyles() : new HashMap<>();
                float width = parsePx(styles.getOrDefault("width", "500px")) * pxToPt;
                float height = parsePx(styles.getOrDefault("height", "200px")) * pxToPt;

                logger.debug("Rendering section [{}] at x={}, y={}, width={}, height={}", 
                    section.getSectionName(), x, y, width, height);

                // Background and Border
                if (styles.containsKey("background-color")) {
                    canvas.setFillColor(parseColor(styles.get("background-color")));
                    canvas.rectangle(x, y - height, width, height);
                    canvas.fill();
                }
                if (styles.containsKey("border-width") && styles.containsKey("border-color")) {
                    canvas.setStrokeColor(parseColor(styles.get("border-color")));
                    canvas.setLineWidth(parsePx(styles.get("border-width")) * pxToPt);
                    if ("dashed".equalsIgnoreCase(styles.get("border-style"))) {
                        canvas.setLineDash(3, 3);
                    } else {
                        canvas.setLineDash(0);
                    }
                    canvas.rectangle(x, y - height, width, height);
                    canvas.stroke();
                    canvas.setLineDash(0);
                }

                // Content
                String content = "";
                if (section.getContent() != null && section.getContent().getContentData() != null) {
                    content = section.getContent().getContentData();
                    logger.info("Section [{}] contentData: {}", section.getSectionName(), content);
                } else {
                    logger.warn("Section [{}] n’a pas de contenu ou contentData est null.", section.getSectionName());
                }

                if (content.isBlank() && section.getSectionName().equalsIgnoreCase("footer")) {
                    content = "Default footer text";
                    logger.info("Section [{}] contentData (default footer): {}", section.getSectionName(), content);
                }

                if (content.isBlank() && !section.getSectionName().equalsIgnoreCase("logo")) {
                    continue;
                }

                if (section.getSectionName().equalsIgnoreCase("logo") && content.startsWith("data:image")) {
                    String base64Image = content.split(",")[1];
                    byte[] imageBytes = Base64.getDecoder().decode(base64Image);
                    PdfImageXObject image = new PdfImageXObject(ImageDataFactory.create(imageBytes));
                    float scaleX = width / image.getWidth();
                    float scaleY = height / image.getHeight();
                    canvas.addXObjectWithTransformationMatrix(image, scaleX, 0, 0, scaleY, x, y - height);
                } else {
                    // Render HTML content at the specified position
                    renderHtmlContent(pdf, canvas, x, y, width, height, content, section.getSectionName());
                }
            }

            pdf.close();
            return baos.toByteArray();
        } catch (Exception e) {
            logger.error("PDF Generation Error: ", e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void renderHtmlContent(PdfDocument pdf, PdfCanvas canvas, float x, float y, float width, float height, String htmlContent, String sectionName) {
        try (ByteArrayOutputStream htmlBaos = new ByteArrayOutputStream()) {
            // Nettoyer le HTML pour supprimer les attributs inutiles
            String cleanHtml = Jsoup.clean(htmlContent, Whitelist.relaxed()
                    .addAttributes(":all", "style", "class"));
            logger.debug("Cleaned HTML for section [{}]: {}", sectionName, cleanHtml);

            // Créer un renderer PDF avec OpenHTMLtoPDF
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.usePdfUaAccessbility(true);
            builder.withHtmlContent(wrapHtmlWithStyles(cleanHtml, width, height), null);

            // Charger les polices
            try {
                builder.useFont(() -> PdfGenerationService.class.getResourceAsStream("/fonts/Inter-Regular.ttf"), "Inter");
                builder.useFont(() -> PdfGenerationService.class.getResourceAsStream("/fonts/NotoEmoji-Regular.ttf"), "Noto Emoji");
            } catch (Exception e) {
                logger.error("Failed to load fonts for section [{}]: ", sectionName, e);
            }

            builder.toStream(htmlBaos);
            builder.run();

            // Vérifier si le PDF temporaire est vide
            byte[] htmlPdfBytes = htmlBaos.toByteArray();
            if (htmlPdfBytes.length == 0) {
                logger.error("Rendered HTML PDF is empty for section [{}] with content: {}", sectionName, cleanHtml);
                return;
            }
            logger.debug("HTML PDF size for section [{}]: {} bytes", sectionName, htmlPdfBytes.length);

            // Sauvegarder le PDF temporaire pour inspection
            try (FileOutputStream fos = new FileOutputStream("temp_html_" + sectionName + ".pdf")) {
                fos.write(htmlPdfBytes);
                logger.debug("Saved temporary PDF for section [{}] to temp_html_{}.pdf", sectionName, sectionName);
            } catch (Exception e) {
                logger.error("Failed to save temporary PDF for section [{}]: ", sectionName, e);
            }

            // Créer un PdfFormXObject pour le contenu HTML
            PdfDocument tempPdf = new PdfDocument(new PdfReader(new ByteArrayInputStream(htmlPdfBytes)));
            PdfFormXObject formXObject = tempPdf.getPage(1).copyAsFormXObject(pdf);
            tempPdf.close();

            // Calculer une échelle dynamique
            float formWidth = formXObject.getWidth();
            float formHeight = formXObject.getHeight();
            float scaleX = formWidth > 0 ? width / formWidth : 1.0f;
            float scaleY = formHeight > 0 ? height / formHeight : 1.0f;
            float scale = Math.min(scaleX, scaleY); // Utiliser l'échelle la plus petite pour éviter la distorsion
            logger.debug("Adding HTML content for section [{}] at x={}, y={}, formWidth={}, formHeight={}, scale={}", 
                sectionName, x, y, formWidth, formHeight, scale);

            // Ajouter le contenu à la position souhaitée
            canvas.addXObjectWithTransformationMatrix(formXObject, scale, 0, 0, scale, x, y - height);
        } catch (Exception e) {
            logger.error("Failed to render HTML content for section [{}]: {}", sectionName, htmlContent, e);
        }
    }

    private String wrapHtmlWithStyles(String htmlContent, float width, float height) {
        // Envelopper le contenu HTML avec des styles pour limiter la taille
        return "<html><head><style>" +
               "body { margin: 0; padding: 5px; font-family: Inter, 'Noto Emoji'; " +
               "width: " + (width / 0.75f) + "px; height: " + (height / 0.75f) + "px; overflow: hidden; }" +
               "* { box-sizing: border-box; }" +
               "table { width: 100%; border-collapse: collapse; }" +
               "td, th { padding: 5px; }" +
               "p, h3 { margin: 5px 0; }" +
               "</style></head><body>" + htmlContent + "</body></html>";
    }

    private float parsePx(String value) {
        try {
            return Float.parseFloat(value.replace("px", "").trim());
        } catch (Exception e) {
            return 0;
        }
    }

    private float clamp(float value, float min, float max) {
        return Math.max(min, Math.min(value, max));
    }

    private DeviceRgb parseColor(String colorStr) {
        try {
            if (colorStr.startsWith("#")) {
                int r = Integer.parseInt(colorStr.substring(1, 3), 16);
                int g = Integer.parseInt(colorStr.substring(3, 5), 16);
                int b = Integer.parseInt(colorStr.substring(5, 7), 16);
                return new DeviceRgb(r, g, b);
            } else if (colorStr.startsWith("rgb")) {
                String[] parts = colorStr.replace("rgb(", "").replace(")", "").split(",");
                return new DeviceRgb(
                        Integer.parseInt(parts[0].trim()),
                        Integer.parseInt(parts[1].trim()),
                        Integer.parseInt(parts[2].trim()));
            }
        } catch (Exception ignored) {}
        return new DeviceRgb(0, 0, 0);
    }
}