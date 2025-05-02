export interface Section {
    id?: number;
    sectionName: string;
    x: number;
    y: number;
    styles: { [key: string]: string };
    content?: any; // Si vous utilisez SectionContent
    modeleFactureId?: number; // Pour la relation
  }