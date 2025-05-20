package com.example.facture.services;

import com.example.facture.models.ModeleFacture;
import com.example.facture.models.Section;
import com.itextpdf.html2pdf.HtmlConverter;
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
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
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
import java.util.List;
import java.util.Map;

@Service
public class PdfGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);
    private static final float PX_TO_PT = 0.75f;
    private static final PageSize PAGE_SIZE = PageSize.A4;

    public byte[] generatePdfFromModele(ModeleFacture modeleFacture, Map<String, String> clientData) {
        logger.info("Generating PDF for model: {}", modeleFacture.getNameModel());
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
            pdf.setDefaultPageSize(PAGE_SIZE);
            Document document = new Document(pdf);

            float pageHeight = PAGE_SIZE.getHeight();
            for (Section section : modeleFacture.getSections()) {
                if (section.getContent() == null || section.getContent().getContentData() == null) {
                    logger.debug("Skipping empty section: {}", section.getSectionName());
                    continue;
                }

                float width = parseSize(section.getStyles(), "width", 300) * PX_TO_PT;
                float height = parseSize(section.getStyles(), "height", 200) * PX_TO_PT;
                float x = section.getX() * PX_TO_PT;
                float y = pageHeight - (section.getY() * PX_TO_PT) - height;

                logger.debug("Positioning section {} at x={}pt, y={}pt, width={}pt, height={}pt",
                        section.getSectionName(), x, y, width, height);

                String processedHtml = processHtmlContent(section);
                processedHtml = replacePlaceholders(processedHtml, clientData);

                String wrappedHtml = wrapHtml(processedHtml, width, height, section.getSectionName(), section.getStyles());
                logger.debug("Final HTML for section {}: {}", section.getSectionName(), wrappedHtml);
                List<IElement> elements = HtmlConverter.convertToElements(wrappedHtml);

                Div container = createStyledContainer(section, x, y, width, height);
                Div contentContainer = new Div().setPadding(parseSize(section.getStyles(), "padding", 10));
                addElementsToContainer(contentContainer, elements, section.getStyles());

                container.add(contentContainer);
                document.add(container);
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            logger.error("Failed to generate PDF for model: {}", modeleFacture.getNameModel(), e);
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] generateThumbnailFromModele(ModeleFacture modeleFacture, Map<String, String> clientData) {
        try {
            // Generate PDF bytes
            byte[] pdfBytes = generatePdfFromModele(modeleFacture, clientData);

            // Load PDF into PDFBox
            try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfBytes))) {
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                // Render first page at 100 DPI (adjust for thumbnail size)
                BufferedImage image = pdfRenderer.renderImageWithDPI(0, 100);
                
                // Convert to PNG
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(image, "png", baos);
                document.close();
                return baos.toByteArray();
            }
        } catch (Exception e) {
            logger.error("Failed to generate thumbnail for model: {}", modeleFacture.getNameModel(), e);
            throw new RuntimeException("Error generating thumbnail", e);
        }
    }

    private String processHtmlContent(Section section) {
        String html = section.getContent().getContentData();
        Map<String, String> styles = section.getStyles();
        org.jsoup.nodes.Document doc = Jsoup.parse(html);

        logger.debug("Styles for section {}: {}", section.getSectionName(), styles);

        if (!doc.select("table").isEmpty()) {
            processTableHtml(doc, styles);
            styleTableElements(doc, styles);
        }

        if (section.getSectionName().equalsIgnoreCase("info-client")) {
            processInfoClientHtml(doc, styles);
        } else if (section.getSectionName().equalsIgnoreCase("calendar")) {
            processCalendarHtml(doc, styles);
        }

        logger.debug("Processed HTML for section {}: {}", section.getSectionName(), doc.body().html());
        return doc.body().html();
    }

    private String replacePlaceholders(String html, Map<String, String> clientData) {
        if (clientData == null) return html;
        
        for (Map.Entry<String, String> entry : clientData.entrySet()) {
            String placeholder = "#" + entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.trim().isEmpty()) {
                html = html.replace(placeholder, value);
            }
        }
        
        return html;
    }

    private void processTableHtml(org.jsoup.nodes.Document doc, Map<String, String> styles) {
        doc.select("table").forEach(table -> {
            table.parents().select("div.relative, div.overflow-x-auto").forEach(div -> div.unwrap());
            table.select("th").forEach(th -> {
                if (th.text().isEmpty() && th.children().isEmpty()) {
                    th.remove();
                }
                th.removeClass("px-4 py-3 text-left font-medium text-gray-800 tracking-wider");
            });
            table.select("td").forEach(td -> {
                td.select("input").forEach(input -> {
                    String value = input.attr("ng-reflect-model");
                    if (value.isEmpty()) {
                        value = input.attr("placeholder") != null ? input.attr("placeholder") : "N/A";
                    }
                    input.replaceWith(doc.createElement("span").text(value));
                });
                if (td.html().contains("<!--bindings") || (td.text().isEmpty() && td.children().isEmpty())) {
                    td.remove();
                }
                td.removeClass("px-4 py-3 whitespace-nowrap");
            });
            table.select("*").forEach(element -> {
                element.attributes().forEach(attr -> {
                    if (attr.getKey().startsWith("ng-")) {
                        element.removeAttr(attr.getKey());
                    }
                });
            });
            table.select("tr").forEach(tr -> {
                if (tr.select("td, th").isEmpty()) {
                    tr.remove();
                }
            });
        });
    }

    private void processCalendarHtml(org.jsoup.nodes.Document doc, Map<String, String> styles) {
        org.jsoup.nodes.Element container = doc.selectFirst(".content-row");
        if (container != null) {
            container.attr("style", "display: flex; flex-direction: row; align-items: center; gap: 20px;");
            doc.select("mat-form-field").forEach(field -> {
                field.attr("style", "flex: 1; min-width: 100px; max-width: 200px; margin: 0;");
                String label = field.selectFirst("mat-label").text();
                String value = field.selectFirst("mat-select .mat-mdc-select-value-text, input") != null
                        ? field.selectFirst("mat-select .mat-mdc-select-value-text, input").text()
                        : "";
                StringBuilder divStyle = new StringBuilder();
                if (styles != null) {
                    appendStyle(divStyle, styles, "font-family", "font-family", "");
                    appendStyle(divStyle, styles, "font-size", "font-size", "");
                    appendStyle(divStyle, styles, "color", "color", "");
                }
                divStyle.append("font-weight: normal;");
                field.html(String.format("<div style='%s'>%s: %s</div>", divStyle.toString(), label, value));
            });
            doc.select(".mat-mdc-select-arrow-wrapper, .mat-datepicker-toggle").remove();
        }
    }

    private void processInfoClientHtml(org.jsoup.nodes.Document doc, Map<String, String> styles) {
        doc.select("tr").forEach(tr -> {
            tr.tagName("div");
            tr.attr("style", "display: block; margin-bottom: 10px;");
        });
        doc.select("td").forEach(td -> {
            td.tagName("div");
            String placeholder = td.select(".input-field").attr("data-placeholder");
            String value = td.select(".input-field").text();
            StringBuilder spanStyle = new StringBuilder();
            if (styles != null) {
                appendStyle(spanStyle, styles, "font-family", "font-family", "");
                appendStyle(spanStyle, styles, "font-size", "font-size", "");
                appendStyle(spanStyle, styles, "color", "color", "");
            }
            spanStyle.append("font-weight: normal;");
            String displayText = value + " : " + placeholder;
            td.html(String.format("<span style='%s'>%s</span>", spanStyle.toString(), displayText));
            td.attr("style", "display: block; padding: 8px;");
        });
        doc.select(".input-container, .input-icon").remove();
        doc.select("table").attr("style", "width: 100%; display: block;");
        doc.select("tbody").unwrap();
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

        String customCss = sectionName.equalsIgnoreCase("info-client")
                ? "table { width: 100%; display: block; } " +
                  "td { display: block; padding: 8px; margin-bottom: 10px; min-height: 100px; border: 1px solid #000; } " +
                  "tr { display: block; margin-bottom: 10px; } " +
                  "thead, tbody { display: block; }"
                : "table { table-layout: fixed; width: 100%; border-collapse: collapse; border: 1px solid #000; } " +
                  "td, th { word-break: break-word; min-height: 100px; border: 1px solid #000; padding: 8px; }";

        return String.format(
                "<!DOCTYPE html><html><head><style>" +
                        "body { margin: 0; padding: 0; font-family: %s; width: %fpx; height: %fpx; overflow: hidden; } " +
                        "%s" +
                        "</style></head><body><div>%s</div></body></html>",
                fontFamily, widthPx, heightPx, customCss, html
        );
    }

    private void addElementsToContainer(Div container, List<IElement> elements, Map<String, String> styles) {
        for (IElement element : elements) {
            if (element instanceof Table) {
                Table table = (Table) element;
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
        if (styles.containsKey(key)) {
            style.append(cssProperty).append(": ").append(styles.get(key)).append("; ");
        } else if (!defaultValue.isEmpty()) {
            style.append(cssProperty).append(": ").append(defaultValue).append("; ");
        }
    }
}