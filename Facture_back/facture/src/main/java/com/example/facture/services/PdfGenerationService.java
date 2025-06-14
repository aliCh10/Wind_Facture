package com.example.facture.services;

import com.example.facture.models.ModeleFacture;
import com.example.facture.models.Section;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.io.exceptions.IOException;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.DashedBorder;
import com.itextpdf.layout.borders.DottedBorder;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.BlockElement;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.element.IElement;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.Property;
import com.itextpdf.layout.properties.TextAlignment;
import com.openhtmltopdf.css.parser.property.PrimitivePropertyBuilders.FontWeight;

import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PdfGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);
    private static final float PX_TO_PT = 0.75f;
    private static final PageSize PAGE_SIZE = PageSize.A4;
    private Map<String, String> factureData;

  public byte[] generatePdfFromModele(ModeleFacture modeleFacture, Map<String, String> factureData) {
        logger.info("Generating PDF for model: {}", modeleFacture.getNameModel());
        try {
            logger.info("Processing sections: {}", modeleFacture.getSections().size());
            for (Section section : modeleFacture.getSections()) {
                logger.info("Section: id={}, name={}", section.getId(), section.getSectionName());
            }
        } catch (Exception e) {
            logger.warn("Failed to log sections: {}", e.getMessage());
        }
        this.factureData = factureData;

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
            pdf.setDefaultPageSize(PAGE_SIZE);
            Document document = new Document(pdf);
            document.setMargins(36, 36, 36, 36); // Marges par défaut

            float pageHeight = PAGE_SIZE.getHeight();

            // Traiter les sections fixes (sauf tableContainer et footer)
            for (Section section : modeleFacture.getSections()) {
                if (section.getContent() == null || section.getContent().getContentData() == null) {
                    logger.warn("Skipping empty section: {}", section.getSectionName());
                    continue;
                }
                if (section.getSectionName().equalsIgnoreCase("tablecontainer") || section.getSectionName().equalsIgnoreCase("footer")) {
                    continue; // Traiter après
                }

                float width = parseSize(section.getStyles(), "width", 0) * PX_TO_PT;
                float height = parseSize(section.getStyles(), "height", 0) * PX_TO_PT;
                float x = section.getX() * PX_TO_PT;
                float y = pageHeight - (section.getY() * PX_TO_PT) - height;

                logger.debug("Positioning section {} at x={}pt, y={}pt, width={}pt, height={}pt",
                        section.getSectionName(), x, y, width, height);

                if (section.getSectionName().equalsIgnoreCase("logo")) {
                    processLogoSection(section, document, x, y, width, height);
                } else {
                    String processedHtml = processHtmlContent(section, factureData);
                    processedHtml = replacePlaceholders(processedHtml, factureData);
                    String wrappedHtml = wrapHtml(processedHtml, width, height, section.getSectionName(), section.getStyles());
                    logger.debug("Final HTML for section {}: {}", section.getSectionName(), wrappedHtml);
                    List<IElement> elements = HtmlConverter.convertToElements(wrappedHtml);

                    Div container = createStyledContainer(section, x, y, width, height);
                    Div contentContainer = new Div().setPadding(parseSize(section.getStyles(), "padding", 10));
                    addElementsToContainer(contentContainer, elements, section.getStyles());

                    container.add(contentContainer);
                    document.add(container);
                }
            }

            // Traiter tableContainer
            Section tableSection = modeleFacture.getSections().stream()
                    .filter(s -> s.getSectionName().equalsIgnoreCase("tablecontainer"))
                    .findFirst()
                    .orElse(null);
            if (tableSection != null && tableSection.getContent() != null && tableSection.getContent().getContentData() != null) {
                float width = parseSize(tableSection.getStyles(), "width", 0) * PX_TO_PT;
                float x = tableSection.getX() * PX_TO_PT;
                float y = tableSection.getY() * PX_TO_PT; // Position Y en pixels

                // Ajouter un espaceur pour respecter la position Y sur la première page
                if (y > 0) {
                    Div spacer = new Div().setHeight(y * PX_TO_PT);
                    document.add(spacer);
                    logger.debug("Added spacer of height {}pt for tableContainer", y * PX_TO_PT);
                }

                String processedHtml = processHtmlContent(tableSection, factureData);
                processedHtml = replacePlaceholders(processedHtml, factureData);
                String wrappedHtml = wrapHtml(processedHtml, width, 0, tableSection.getSectionName(), tableSection.getStyles());
                logger.debug("Final HTML for section {}: {}", tableSection.getSectionName(), wrappedHtml);
                List<IElement> elements = HtmlConverter.convertToElements(wrappedHtml);

                Div container = new Div();
                container.setMarginLeft(x); // Position horizontale
                container.setWidth(width);
                Div contentContainer = new Div().setPadding(parseSize(tableSection.getStyles(), "padding", 10));
                addElementsToContainer(contentContainer, elements, tableSection.getStyles());

                container.add(contentContainer);
                document.add(container);

                // Ajouter le récapitulatif (subtotal, taxes, total) après la table
                if (factureData != null && factureData.containsKey("subtotal")) {
                    Div summaryContainer = new Div();
                    summaryContainer.setMarginLeft(x);
                    summaryContainer.setWidth(width);
                    summaryContainer.setBackgroundColor(new DeviceRgb(243, 244, 246)); // #f3f4f6
                    summaryContainer.setPadding(12);
                    summaryContainer.setMarginTop(0); // Pas d'espace avant le récapitulatif

                    Div summaryContent = new Div();
                   summaryContent.setTextAlignment(TextAlignment.RIGHT);
                   summaryContent.setBold();


                    Paragraph subtotal = new Paragraph("Subtotal: " + factureData.getOrDefault("subtotal", "0.00"))
                            .setMarginBottom(4);
                    Paragraph taxes = new Paragraph("Taxes: " + factureData.getOrDefault("taxes", "0.00"))
                            .setMarginBottom(4);
                    Paragraph total = new Paragraph("Total: " + factureData.getOrDefault("totalAmount", "0.00"))
                            .setFontColor(new DeviceRgb(37, 99, 235)) // #2563eb
                           .setBold();


                    summaryContent.add(subtotal);
                    summaryContent.add(taxes);
                    summaryContent.add(total);

                    summaryContainer.add(summaryContent);
                    document.add(summaryContainer);
                    logger.debug("Added summary container with subtotal: {}, taxes: {}, total: {}",
                            factureData.get("subtotal"), factureData.get("taxes"), factureData.get("totalAmount"));
                }
            }

            // Traiter footer immédiatement après le récapitulatif
            Section footerSection = modeleFacture.getSections().stream()
                    .filter(s -> s.getSectionName().equalsIgnoreCase("footer"))
                    .findFirst()
                    .orElse(null);
            if (footerSection != null && footerSection.getContent() != null && footerSection.getContent().getContentData() != null) {
                float width = parseSize(footerSection.getStyles(), "width", 0) * PX_TO_PT;
                float height = parseSize(footerSection.getStyles(), "height", 0) * PX_TO_PT;
                float x = footerSection.getX() * PX_TO_PT;

                String processedHtml = processHtmlContent(footerSection, factureData);
                processedHtml = replacePlaceholders(processedHtml, factureData);
                String wrappedHtml = wrapHtml(processedHtml, width, height, footerSection.getSectionName(), footerSection.getStyles());
                logger.debug("Final HTML for section {}: {}", footerSection.getSectionName(), wrappedHtml);
                List<IElement> elements = HtmlConverter.convertToElements(wrappedHtml);

                Div container = new Div();
                container.setMarginLeft(x);
                container.setWidth(width);
                container.setHeight(height);
                container.setMarginTop(5); // Espacement minimal après le récapitulatif
                Div contentContainer = new Div().setPadding(parseSize(footerSection.getStyles(), "padding", 10));
                addElementsToContainer(contentContainer, elements, footerSection.getStyles());

                container.add(contentContainer);
                document.add(container);
            }

            document.close();
            logger.info("PDF generated successfully");
            return baos.toByteArray();
        } catch (Exception e) {
            logger.error("Failed to generate PDF for model: {}", modeleFacture.getNameModel(), e);
            throw new RuntimeException("Error generating PDF", e);
        }
    } 
    
    private void processLogoSection(Section section, Document document, float x, float y, float width, float height) {
        String html = section.getContent().getContentData();
        logger.debug("Logo section HTML: {}", html);
        org.jsoup.nodes.Document doc = Jsoup.parse(html);
        org.jsoup.nodes.Element imgElement = doc.selectFirst("img.uploaded-image");

        if (imgElement == null || imgElement.attr("src").isEmpty()) {
            logger.warn("No image found in logo section or src is empty for section: {}", section.getSectionName());
            return;
        }

        String imageUrl = imgElement.attr("src");
        logger.debug("Processing logo image with URL: {}", imageUrl);
        try {
            ImageData imageData;
            byte[] imageBytes;

            if (imageUrl.startsWith("data:image/")) {
                String base64String = imageUrl.split(",")[1];
                imageBytes = Base64.getDecoder().decode(base64String);
                imageData = ImageDataFactory.create(imageBytes);
                logger.debug("Successfully decoded base64 image");
            } else {
                try (CloseableHttpClient client = HttpClients.createDefault()) {
                    HttpGet request = new HttpGet(imageUrl);
                    try (CloseableHttpResponse response = client.execute(request)) {
                        if (response.getStatusLine().getStatusCode() != 200) {
                            throw new IOException("Failed to fetch image, status code: " + response.getStatusLine().getStatusCode());
                        }
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        response.getEntity().writeTo(baos);
                        imageBytes = baos.toByteArray();
                        logger.debug("Fetched image bytes, size: {} bytes", imageBytes.length);
                    }
                }

                if (imageUrl.toLowerCase().endsWith(".webp")) {
                    logger.debug("Detected WebP image, attempting to convert to PNG");
                    try (ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes)) {
                        BufferedImage bufferedImage = ImageIO.read(bais);
                        if (bufferedImage == null) {
                            logger.warn("ImageIO failed to read WebP image, attempting direct processing");
                            try {
                                imageData = ImageDataFactory.create(imageBytes);
                                logger.debug("Direct WebP processing successful");
                            } catch (Exception e) {
                                logger.error("Direct WebP processing failed, image may be corrupted or unsupported");
                                throw new IOException("Failed to process WebP image directly", e);
                            }
                        } else {
                            ByteArrayOutputStream pngBaos = new ByteArrayOutputStream();
                            ImageIO.write(bufferedImage, "png", pngBaos);
                            imageBytes = pngBaos.toByteArray();
                            imageData = ImageDataFactory.create(imageBytes);
                            logger.debug("Converted WebP to PNG, size: {} bytes", imageBytes.length);
                        }
                    }
                } else {
                    imageData = ImageDataFactory.create(imageBytes);
                    logger.debug("Successfully created image data from non-WebP URL");
                }
            }

            Image pdfImage = new Image(imageData);
            pdfImage.setWidth(width);
            pdfImage.setHeight(height);
            pdfImage.scaleToFit(width, height);

            Div container = createStyledContainer(section, x, y, width, height);
            container.add(pdfImage);

            document.add(container);
            logger.debug("Added logo image at x={}pt, y={}pt, width={}pt, height={}pt", x, y, width, height);
        } catch (Exception e) {
            logger.error("Failed to process logo image for section {} with URL {}: {}", 
                         section.getSectionName(), imageUrl, e.getMessage(), e);
        }
    }

    public byte[] generateThumbnailFromModele(ModeleFacture modeleFacture, Map<String, String> factureData) {
        try {
            byte[] pdfBytes = generatePdfFromModele(modeleFacture, factureData);
            try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfBytes))) {
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                BufferedImage image = pdfRenderer.renderImageWithDPI(0, 100);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(image, "png", baos);
                return baos.toByteArray();
            }
        } catch (Exception e) {
            logger.error("Failed to generate thumbnail for model: {}", modeleFacture.getNameModel(), e);
            throw new RuntimeException("Error generating thumbnail", e);
        }
    }

    private String processHtmlContent(Section section, Map<String, String> factureData) {
        String html = section.getContent().getContentData();
        Map<String, String> styles = section.getStyles();
        org.jsoup.nodes.Document doc = Jsoup.parse(html);

        logger.debug("Processing section {} with styles: {}", section.getSectionName(), styles);
        logger.debug("Input HTML for section {}: {}", section.getSectionName(), doc.html());

        doc.select("*").forEach(element -> {
            element.attributes().forEach(attr -> {
                if (attr.getKey().startsWith("ng-") || attr.getKey().startsWith("_ng") || attr.getKey().startsWith("cdk")) {
                    element.removeAttr(attr.getKey());
                }
            });
        });

        switch (section.getSectionName().toLowerCase()) {
            case "tablecontainer":
                if (!doc.select("div.relative div.overflow-x-auto table.min-w-full, table.min-w-full, table").isEmpty()) {
                    html = processTableHtml(doc, styles, factureData);
                    styleTableElements(doc, styles);
                } else {
                    logger.warn("No table found in tableContainer section");
                }
                break;
            case "info-client":
                processInfoClientHtml(doc, styles, factureData);
                break;
            case "calendar":
                processCalendarHtml(doc, styles, factureData);
                break;
            case "footer":
                processFooterHtml(doc, styles, factureData);
                break;
            case "company":
                processCompanyHtml(doc, styles, factureData);
                break;
            default:
                logger.debug("No specific processing for section: {}", section.getSectionName());
        }

        html = doc.body().html();
        logger.debug("Processed HTML for section {}: {}", section.getSectionName(), html);
        return html;
    }

    private String replacePlaceholders(String html, Map<String, String> factureData) {
        if (factureData == null || html == null) {
            logger.warn("Null factureData or html, returning original html");
            return html;
        }

        logger.info("Input HTML: {}", html);
        logger.info("factureData: {}", factureData);
        String result = html;
        for (Map.Entry<String, String> entry : factureData.entrySet()) {
            String placeholder = "#" + entry.getKey();
            String value = entry.getValue() != null ? entry.getValue() : "";
            if (result.contains(placeholder) && !placeholder.equals("#footerText")) {
                logger.debug("Replacing {} with {}", placeholder, value);
                result = result.replace(placeholder, value);
            } else {
                logger.debug("Placeholder {} not found in HTML or skipped", placeholder);
            }
        }

        logger.info("Processed HTML: {}", result);
        return result;
    }

   private String processTableHtml(org.jsoup.nodes.Document doc, Map<String, String> styles, Map<String, String> factureData) {
    logger.info("Processing table HTML for tableContainer with factureData: {}", factureData);
    logger.debug("Input HTML: {}", doc.html());

    org.jsoup.nodes.Element table = doc.selectFirst("table");
    if (table == null) {
        logger.error("No table found in tableContainer section. Creating a default table.");
        table = doc.body().appendElement("table").addClass("min-w-full");
        table.appendElement("thead").appendElement("tr");
        table.appendElement("tbody");
    }

    table.parents().select("div.relative, div.overflow-x-auto").forEach(div -> div.unwrap());

    org.jsoup.nodes.Element thead = table.selectFirst("thead");
    if (thead == null) {
        logger.warn("No thead found, creating one");
        thead = table.prependElement("thead");
        org.jsoup.nodes.Element headerRow = thead.appendElement("tr");
        String[] columns = {"Reference", "TVA", "Discount", "Quantity", "Price", "Total"};
        for (String col : columns) {
            headerRow.appendElement("th").text(col);
        }
    } else {
        thead.select("tr th:last-child").remove();
        org.jsoup.nodes.Element headerRow = thead.selectFirst("tr");
        if (headerRow != null) {
            headerRow.appendElement("th").text("Total");
            logger.debug("Added Total column to thead");
        }
    }

    org.jsoup.nodes.Element tbody = table.selectFirst("tbody");
    if (tbody == null) {
        logger.warn("No tbody found in table, creating one");
        tbody = table.appendElement("tbody");
    }

    String[] columns = {"reference", "tva", "discount", "quantity", "price", "total"};
    String[] mainServiceKeys = {"serviceReference", "tva", "discount", "quantity", "servicePrice", "serviceTotal"};
    String[] additionalServiceKeys = {"reference", "tva", "discount", "quantity", "price", "total"};
    String[] placeholders = {"#reference", "#tva", "#discount", "#quantity", "#price", "#total"};

    tbody.select("tr").remove();
    logger.debug("Cleared existing rows in tbody");

    // Ajout du service principal
    if (factureData != null && factureData.containsKey("serviceReference")) {
        org.jsoup.nodes.Element row = tbody.appendElement("tr");
        appendServiceRow(row, factureData, "", mainServiceKeys, placeholders);
        logger.debug("Added main service row");
    }

    // Ajout des services supplémentaires
    int rowCount = 1;
    while (factureData != null && factureData.containsKey("service_" + rowCount + "_reference")) {
        org.jsoup.nodes.Element row = tbody.appendElement("tr");
        appendServiceRow(row, factureData, "service_" + rowCount + "_", additionalServiceKeys, placeholders);
        logger.debug("Added additional service row {} with prefix service_{}_", rowCount, rowCount);
        rowCount++;
    }

    // Nettoyage des attributs Angular
    table.select("*").forEach(element -> {
        element.attributes().forEach(attr -> {
            if (attr.getKey().startsWith("ng-") || attr.getKey().startsWith("_ng") || attr.getKey().startsWith("cdk")) {
                element.removeAttr(attr.getKey());
            }
        });
    });

    table.attr("style", buildTableStyle(styles));
    table.select("td").forEach(td -> td.attr("style", buildCellStyle(styles)));
    table.select("th").forEach(th -> th.attr("style", buildHeaderStyle(styles)));

    String result = doc.body().html();
    logger.info("Processed table HTML: {}", result);
    return result;
}
    private void appendServiceRow(org.jsoup.nodes.Element row, Map<String, String> factureData, String prefix, String[] factureKeys, String[] placeholders) {
        for (int i = 0; i < factureKeys.length; i++) {
            String factureKey = prefix + factureKeys[i];
            String placeholder = placeholders[i];
            String value = factureData.getOrDefault(factureKey, placeholder);
            row.appendElement("td").appendElement("span").text(value);
            logger.debug("Appending table column {} with value {}", factureKey, value);
        }
    }

    private void processCalendarHtml(org.jsoup.nodes.Document doc, Map<String, String> styles, Map<String, String> factureData) {
        logger.info("Processing calendar HTML with factureData: {}", factureData);
        org.jsoup.nodes.Element container = doc.selectFirst("div");
        if (container == null) {
            logger.warn("No container found in calendar section");
            return;
        }

        container.html("");
        container.attr("style", "display: flex; flex-direction: column; gap: 8px;");

        String creationDate = factureData != null ? factureData.get("creationDate") : null;
        String dueDate = factureData != null ? factureData.get("dueDate") : null;

        org.jsoup.nodes.Element creationLine = container.appendElement("div")
            .attr("style", "display: flex; gap: 5px;");
        
        org.jsoup.nodes.Element creationTitle = createStyledSpan("Date Création:", styles);
        creationTitle.attr("style", creationTitle.attr("style") + "font-weight: bold;");
        creationLine.appendChild(creationTitle);
        
        String creationText = (creationDate != null && !creationDate.equals("N/A")) 
            ? creationDate 
            : "#creationDate";
        creationLine.appendChild(createStyledSpan(creationText, styles));
        logger.debug("Added creationDate: {}", creationText);

        org.jsoup.nodes.Element dueLine = container.appendElement("div")
            .attr("style", "display: flex; gap: 5px;");
        
        org.jsoup.nodes.Element dueTitle = createStyledSpan("Date Échéance:", styles);
        dueTitle.attr("style", dueTitle.attr("style") + "font-weight: bold;");
        dueLine.appendChild(dueTitle);
        
        String dueText = (dueDate != null && !dueDate.equals("N/A")) 
            ? dueDate 
            : "#dueDate";
        dueLine.appendChild(createStyledSpan(dueText, styles));
        logger.debug("Added dueDate: {}", dueText);

        container.select("mat-form-field, mat-label, mat-select, mat-option, mat-datepicker-toggle, mat-datepicker").remove();
        logger.debug("Processed calendar HTML: {}", doc.html());
    }

    private void processInfoClientHtml(org.jsoup.nodes.Document doc, Map<String, String> styles, Map<String, String> factureData) {
        logger.info("Processing info-client HTML with factureData: {}", factureData);
        logger.debug("Input HTML: {}", doc.html());

        org.jsoup.nodes.Element container = doc.body().appendElement("div");
        container.attr("style", "display: flex; flex-direction: column; gap: 8px; align-items: flex-start;");

        Map<String, String> fieldTitles = new HashMap<>();
        fieldTitles.put("clientName", "Nom:");
        fieldTitles.put("clientAddress", "Adresse:");
        fieldTitles.put("clientPhone", "Téléphone:");
        fieldTitles.put("clientRIB", "RIB:");

        String[] fields = {"clientName", "clientAddress", "clientPhone", "clientRIB"};
        for (String field : fields) {
            String placeholder = "#" + field;
            String value = (factureData != null && factureData.containsKey(field)) 
                ? factureData.get(field) 
                : placeholder;

            org.jsoup.nodes.Element lineDiv = container.appendElement("div")
                .attr("style", "display: flex; gap: 5px; align-items: flex-start;");

            org.jsoup.nodes.Element titleSpan = createStyledSpan(fieldTitles.get(field), styles);
            titleSpan.attr("style", titleSpan.attr("style") + "font-weight: bold;");
            lineDiv.appendChild(titleSpan);

            org.jsoup.nodes.Element valueSpan = createStyledSpan(value, styles);
            lineDiv.appendChild(valueSpan);

            logger.debug("Added field: {} with title: {} and value: {}", field, fieldTitles.get(field), value);
        }

        doc.select("table, tbody, tr, td, .input-container, .input-field, .input-icon").remove();
        logger.info("Processed HTML: {}", doc.html());
    }

    private void processCompanyHtml(org.jsoup.nodes.Document doc, Map<String, String> styles, Map<String, String> factureData) {
        logger.info("Processing company HTML with factureData: {}", factureData);
        logger.debug("Input HTML: {}", doc.html());

        org.jsoup.nodes.Element container = doc.body().appendElement("div");
        container.attr("style", "display: flex; flex-direction: column; gap: 8px; align-items: flex-start;");

        Map<String, String> fieldTitles = new HashMap<>();
        fieldTitles.put("companyName", "Nom:");
        fieldTitles.put("companyAddress", "Adresse:");
        fieldTitles.put("companyPhone", "Téléphone:");

        String[] fields = {"companyName", "companyAddress", "companyPhone"};
        for (String field : fields) {
            String placeholder = "#" + field;
            String value = (factureData != null && factureData.containsKey(field)) 
                ? factureData.get(field) 
                : placeholder;

            org.jsoup.nodes.Element lineDiv = container.appendElement("div")
                .attr("style", "display: flex; gap: 5px; align-items: flex-start;");

            org.jsoup.nodes.Element titleSpan = createStyledSpan(fieldTitles.get(field), styles);
            titleSpan.attr("style", titleSpan.attr("style") + "font-weight: bold;");
            lineDiv.appendChild(titleSpan);

            org.jsoup.nodes.Element valueSpan = createStyledSpan(value, styles);
            lineDiv.appendChild(valueSpan);

            logger.debug("Added field: {} with title: {} and value: {}", field, fieldTitles.get(field), value);
        }

        doc.select("table, tbody, tr, td, .input-container").remove();
        logger.info("Processed HTML: {}", doc.html());
    }

    private void processFooterHtml(org.jsoup.nodes.Document doc, Map<String, String> styles, Map<String, String> factureData) {
        logger.info("Processing footer HTML with factureData: {}", factureData);
        org.jsoup.nodes.Element container = doc.selectFirst("div");
        if (container == null) {
            logger.warn("No container found in footer section");
            return;
        }

        container.html("");
        container.attr("style", "display: flex; flex-direction: column; gap: 10px;");

        String footerText = factureData != null ? factureData.get("footerText") : null;
        String footerContent = (footerText != null && !footerText.equals("N/A") && !footerText.trim().isEmpty()) 
            ? footerText 
            : "#footerText";

        org.jsoup.nodes.Element footerSpan = createStyledSpan(footerContent, styles);
        org.jsoup.nodes.Element footerDiv = new org.jsoup.nodes.Element("div").appendChild(footerSpan);
        container.appendChild(footerDiv);
        logger.debug("Added footerText: {}", footerContent);

        container.select("h3, .footer-title, .footer-section, .footer-text").remove();
        logger.debug("Processed footer HTML: {}", doc.html());
    }

    private org.jsoup.nodes.Element createStyledSpan(String content, Map<String, String> styles) {
        StringBuilder spanStyle = new StringBuilder();
        appendStyle(spanStyle, styles, "font-family", "font-family", "Inter, sans-serif");
        appendStyle(spanStyle, styles, "font-size", "font-size", "16px");
        appendStyle(spanStyle, styles, "color", "color", "#000000");
        spanStyle.append("font-weight: normal;");

        return new org.jsoup.nodes.Element("span")
                .html(content)
                .attr("style", spanStyle.toString());
    }

    private void styleTableElements(org.jsoup.nodes.Document doc, Map<String, String> styles) {
        doc.select("table").forEach(table -> {
            String currentStyle = table.attr("style");
            currentStyle = currentStyle == null ? "" : currentStyle;
            String tableStyle = buildTableStyle(styles);
            table.attr("style", currentStyle + tableStyle);
            logger.debug("Table style applied: {}", currentStyle + tableStyle);
        });
        doc.select("td").forEach(cell -> {
            String currentStyle = cell.attr("style");
            currentStyle = currentStyle == null ? "" : currentStyle;
            String cellStyle = buildCellStyle(styles);
            cell.attr("style", currentStyle + cellStyle);
            logger.debug("TD style applied: {}", currentStyle + cellStyle);
        });
        doc.select("th").forEach(header -> {
            String currentStyle = header.attr("style");
            currentStyle = currentStyle == null ? "" : currentStyle;
            String headerStyle = buildHeaderStyle(styles);
            header.attr("style", currentStyle + headerStyle);
            logger.debug("TH style applied: {}", currentStyle + headerStyle);
        });
        if (styles != null && styles.containsKey("alternate-row-color")) {
            String styleTag = "<style>tr:nth-child(even) { background-color: " + styles.get("alternate-row-color") + "; }</style>";
            doc.head().append(styleTag);
        }
    }

    private String buildTableStyle(Map<String, String> styles) {
        StringBuilder style = new StringBuilder();
        style.append("width: 100%; border-collapse: collapse; margin: 0; border: 1px solid #000; ");
        if (styles != null) {
            appendStyle(style, styles, "table-width", "", "");
            appendStyle(style, styles, "table-border", "border", "");
        }
        return style.toString();
    }

    private String buildCellStyle(Map<String, String> styles) {
        StringBuilder style = new StringBuilder();
        style.append("word-wrap: break-word; overflow-wrap: break-word; border: 1px solid #000; padding: 8px; ");
        if (styles != null) {
            appendStyle(style, styles, "cell-border", "border", "");
            appendStyle(style, styles, "cell-padding", "padding", "");
            appendStyle(style, styles, "cell-text-align", "text-align", "");
            appendStyle(style, styles, "font-family", "font-family", "");
            appendStyle(style, styles, "font-size", "font-size", "");
            appendStyle(style, styles, "cell-height", "min-height", "100px");
        } else {
            style.append("min-height: 100px; ");
        }
        return style.toString();
    }

    private String buildHeaderStyle(Map<String, String> styles) {
        StringBuilder style = new StringBuilder();
        style.append("border: 1px solid #000; padding: 8px; ");
        if (styles != null) {
            appendStyle(style, styles, "header-background-color", "background-color", "");
            appendStyle(style, styles, "header-color", "color", "");
            appendStyle(style, styles, "header-font-weight", "font-weight", "");
            appendStyle(style, styles, "header-text-align", "text-align", "");
            appendStyle(style, styles, "header-border", "border", "");
            appendStyle(style, styles, "header-padding", "padding", "");
            appendStyle(style, styles, "font-family", "font-family", "");
            appendStyle(style, styles, "font-size", "font-size", "");
            appendStyle(style, styles, "header-height", "min-height", "100px");
        } else {
            style.append("min-height: 100px; ");
        }
        return style.toString();
    }

    private Div createStyledContainer(Section section, float x, float y, float width, float height) {
        Div container = new Div().setFixedPosition(x, y, width).setHeight(height);
        Map<String, String> styles = section.getStyles();

        if (styles != null) {
            if (styles.containsKey("background-color") && !section.getSectionName().toLowerCase().contains("table")) {
                Color color = parseColor(styles.get("background-color"));
                if (color != null) {
                    container.setBackgroundColor(color);
                }
            }

            if (styles.containsKey("border-width") && styles.containsKey("border-color")) {
                float borderWidth = parseSize(styles, "border-width", 1);
                Color borderColor = parseColor(styles.get("border-color"));
                String borderStyle = styles.getOrDefault("border-style", "solid").toLowerCase();

                if (borderColor != null && !borderStyle.equals("none")) {
                    Border border;
                    switch (borderStyle) {
                        case "dashed":
                            border = new DashedBorder(borderColor, borderWidth);
                            break;
                        case "dotted":
                            border = new DottedBorder(borderColor, borderWidth);
                            break;
                        case "solid":
                        default:
                            border = new SolidBorder(borderColor, borderWidth);
                            break;
                    }
                    container.setBorder(border);
                }
            }
        }
        return container;
    }

private String wrapHtml(String html, float widthPt, float heightPt, String sectionName, Map<String, String> styles) {
    float widthPx = widthPt / PX_TO_PT;
    float heightPx = heightPt / PX_TO_PT;
    String fontFamily = styles != null && styles.containsKey("font-family") ? styles.get("font-family") : "Inter, sans-serif";

    String customCss;
    if (sectionName.equalsIgnoreCase("info-client") || sectionName.equalsIgnoreCase("company")) {
        customCss = "div { display: flex; flex-direction: column; gap: 8px; } " +
                    "div > div { display: flex; align-items: center; gap: 8px; padding: 8px; } " +
                    "span { font-size: " + styles.getOrDefault("font-size", "14px") + "; " +
                    "color: " + styles.getOrDefault("color", "#94a3b8") + "; }";
    } else if (sectionName.equalsIgnoreCase("tablecontainer")) {
        customCss = "table { table-layout: fixed; width: 100%; border-collapse: collapse; border: 1px solid #000; } " +
                    "td, th { word-break: break-word; min-height: 100px; border: 1px solid #000; padding: 8px; }";
    } else {
        customCss = "";
    }

    return String.format(
            "<!DOCTYPE html><html><head><style>" +
                    "body { margin: 0; padding: 0; width: %fpx; %s overflow: hidden; } " +
                    "%s" +
                    "</style></head><body><div>%s</div></body></html>",
            widthPx, 
            sectionName.equalsIgnoreCase("tablecontainer") ? "" : "height: " + heightPx + "px;",
            customCss, 
            html
    );
}

   private void addElementsToContainer(Div container, List<IElement> elements, Map<String, String> styles) {
    for (IElement element : elements) {
        if (element instanceof Table) {
            Table table = (Table) element;
            table.setKeepTogether(false); // Allow table to split across pages
            // No need for PdfStructureAttributes.HEADER; header repetition is handled by <thead>
            float cellHeight = styles != null && styles.containsKey("cell-height")
                    ? parseSize(styles, "cell-height", 100) * PX_TO_PT
                    : 100 * PX_TO_PT;

            for (IElement childElement : table.getChildren()) {
                if (childElement instanceof Cell) {
                    Cell cell = (Cell) childElement;
                    cell.setMinHeight(cellHeight);
                    cell.setBorder(new SolidBorder(1));
                    cell.setPadding(8);
                }
            }
            container.add(table);
        } else if (element instanceof BlockElement) {
            container.add((BlockElement<?>) element);
        } else {
            container.add(new Paragraph().add((com.itextpdf.layout.element.IBlockElement) element));
        }
    }
}

    private Color parseColor(String colorStr) {
        if (colorStr == null || colorStr.isEmpty()) {
            return null;
        }
        try {
            if (colorStr.startsWith("#")) {
                return new DeviceRgb(
                        Integer.parseInt(colorStr.substring(1, 3), 16),
                        Integer.parseInt(colorStr.substring(3, 5), 16),
                        Integer.parseInt(colorStr.substring(5, 7), 16)
                );
            } else if (colorStr.startsWith("rgb(")) {
                String[] parts = colorStr.substring(4, colorStr.length() - 1).split(",");
                return new DeviceRgb(
                        Integer.parseInt(parts[0].trim()),
                        Integer.parseInt(parts[1].trim()),
                        Integer.parseInt(parts[2].trim())
                );
            }
        } catch (Exception e) {
            logger.warn("Invalid color format: {}", colorStr);
        }
        return null;
    }

    private float parseSize(Map<String, String> styles, String property, float defaultValue) {
        if (styles != null && styles.containsKey(property)) {
            try {
                return Float.parseFloat(styles.get(property).replace("px", "").trim());
            } catch (NumberFormatException e) {
                logger.warn("Invalid {} value: {}", property, styles.get(property));
            }
        }
        return defaultValue;
    }

    private void appendStyle(StringBuilder style, Map<String, String> styles, String key, String cssProperty, String defaultValue) {
        if (styles != null && styles.containsKey(key)) {
            style.append(cssProperty).append(": ").append(styles.get(key)).append("; ");
        } else if (!defaultValue.isEmpty()) {
            style.append(cssProperty).append(": ").append(defaultValue).append("; ");
        }
    }
}