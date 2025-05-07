export interface Section {
  id?: number;
  sectionName: string;
  x: number;
  y: number;
  styles: { [key: string]: string };
  content?: SectionContent; // Typage explicite
  modeleFactureId?: number;
  applyContent?(content: string): void; // Méthode facultative
}

export interface SectionContent {
  id?: number;
  contentData: string; // Contient le HTML brut
  sectionId?: number;  // Relation avec la section
}