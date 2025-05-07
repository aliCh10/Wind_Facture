import { Injectable } from '@angular/core';
import { Section, SectionContent } from '../models/section.model';

@Injectable({
    providedIn: 'root'
})
export class SectionDataCollectorService {
    collectSectionData(components: any[]): Section[] {
        return components.map(component => {
            // Collecter le contenu HTML si la méthode existe
            const content: SectionContent = component.getSectionContent
                ? component.getSectionContent()
                : { contentData: '' };

            return {
                id: component.id,
                sectionName: component.sectionName,
                x: component.x,
                y: component.y,
                styles: component.styles ,
                content: content,
                modeleFactureId: component.modeleFactureId
            };
        });
    }
}