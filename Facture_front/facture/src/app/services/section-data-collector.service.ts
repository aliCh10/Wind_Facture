// section-data-collector.service.ts
import { Injectable } from '@angular/core';
import { Section } from '../models/section.model';

@Injectable({
    providedIn: 'root'
})
export class SectionDataCollectorService {
    collectSectionData(components: Section[]): Section[] {
        return components.map(component => ({
            id: component.id,
            sectionName: component.sectionName,
            x: component.x,
            y: component.y,
            styles: component.styles || {},
            content: component.content || null,
            modeleFactureId: component.modeleFactureId
        }));
    
    }
    
}