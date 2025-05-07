import { CdkDragDrop, CdkDragEnd, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { StyleManagerService } from '../../../services/StyleManagerService';
import { Subscription } from 'rxjs';
import { Section, SectionContent } from '../../../models/section.model';

@Component({
  selector: 'app-info-client',
  standalone: false,
  templateUrl: './info-client.component.html',
  styleUrls: ['./info-client.component.css'],
})
export class InfoClientComponent implements Section, OnInit, OnDestroy {
  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLDivElement>;
  @Input() boundaryElement?: HTMLElement;
  @Input() containerRef!: ElementRef<HTMLDivElement>;
  @Output() openOptions = new EventEmitter<string>();

  // Keep clients array for row management, even if data isn't editable
  clients: { nom: string; telephone: string; adresse: string; rib: string }[] = [
    { nom: '', telephone: '', adresse: '', rib: '' },
  ];
  backgroundColor = '#ffffff';
  borderColor = '#cbd5e1';
  borderStyle = 'dashed';
  borderWidth = 1.8;
  borderRadius = 12;
  textColor = '#94a3b8';
  fontFamily = 'Inter';
  fontSize = 14;
  width = 400; // Default width in pixels
  height = 210; // Default height in pixels
  id?: number; // Optional, can be set if needed (e.g., from parent or service)
  sectionName: string = 'info-client';
  x: number = 370; // Maps to position.x
  y: number = 210; // Maps to position.y
  styles: { [key: string]: string } = {};

  private stylesSubscription!: Subscription;

  constructor(private styleManager: StyleManagerService) {}

  ngOnInit() {
    this.stylesSubscription = this.styleManager.componentStyles$.subscribe(styles => {
        const componentStyles = styles['info-client'] || {};
        this.loadStyles(componentStyles);
        this.applyStyles(false);
    });

    const initialStyles = this.styleManager.getStyles('info-client');
    this.loadStyles(initialStyles);
    this.applyStyles(false);
    
    // Initialisez this.styles avec les valeurs par défaut/modifiées
    this.styles = this.getCurrentStyles();
}

  ngOnDestroy() {
    this.stylesSubscription?.unsubscribe();
  }

  private loadStyles(styles: { [key: string]: string | undefined }) {
    this.backgroundColor = styles['background-color'] || this.backgroundColor;
    this.borderColor = styles['border-color'] || this.borderColor;
    this.borderStyle = styles['border-style'] || this.borderStyle;
    this.borderWidth = this.parsePixelValue(styles['border-width'], this.borderWidth);
    this.borderRadius = this.parsePixelValue(styles['border-radius'], this.borderRadius);
    this.textColor = styles['color'] || this.textColor;
    this.fontFamily = styles['font-family'] || this.fontFamily;
    this.fontSize = this.parsePixelValue(styles['font-size'], this.fontSize);
    this.width = this.parsePixelValue(styles['width'], this.width);
    this.height = this.parsePixelValue(styles['height'], this.height);
  }

  private parsePixelValue(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const num = parseFloat(value.replace(/px|\s/g, ''));
    return isNaN(num) ? defaultValue : num;
  }

  public applyStyles(updateService: boolean = true) {
    const tableEl = this.tableContainer?.nativeElement;
    if (!tableEl) return;

    // Apply container styles
    tableEl.style.backgroundColor = this.backgroundColor;
    tableEl.style.border = `${this.borderWidth}px ${this.borderStyle} ${this.borderColor}`;
    tableEl.style.borderRadius = `${this.borderRadius}px`;
    tableEl.style.width = `${this.width}px`;
    tableEl.style.height = `${this.height}px`;

    // Apply text styles to .input-field elements
    tableEl.querySelectorAll('.input-field').forEach((element: Element) => {
      const htmlEl = element as HTMLElement;
      htmlEl.style.color = this.textColor;
      htmlEl.style.fontFamily = this.fontFamily;
      htmlEl.style.fontSize = `${this.fontSize}px`;
    });

    // Update the styles property for SectionDataCollectorService
    this.styles = this.getCurrentStyles();

    // Update StyleManagerService if requested
    if (updateService) {
      this.styleManager.updateStyles('info-client', this.styles, 'InfoClientComponent');
    }
  }

  drop(event: CdkDragDrop<{ nom: string; telephone: string; adresse: string; rib: string }[]>) {
    moveItemInArray(this.clients, event.previousIndex, event.currentIndex);
  }

  onDragEnd(event: CdkDragEnd) {
    if (!this.boundaryElement) return;

    const tableElement = this.tableContainer.nativeElement;
    const containerRect = this.boundaryElement.getBoundingClientRect();
    const tableRect = tableElement.getBoundingClientRect();

    const newX = this.x + event.distance.x;
    const newY = this.y + event.distance.y;

    const minX = 0;
    const minY = 0;
    const maxX = containerRect.width - tableRect.width;
    const maxY = containerRect.height - tableRect.height;

    this.x = Math.max(minX, Math.min(newX, maxX));
    this.y = Math.max(minY, Math.min(newY, maxY));

    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });

    this.updateInfoClientPosition();
  }

  public updateInfoClientPosition(): void {
    if (this.tableContainer?.nativeElement) {
      const element = this.tableContainer.nativeElement;
      element.style.left = `${this.x}px`;
      element.style.top = `${this.y}px`;
    }
  }

  openOptionsPanel() {
    this.openOptions.emit('info-client');
  }
  
  getCurrentStyles(): { [key: string]: string } {
    return {
      'background-color': this.backgroundColor,
      'border-color': this.borderColor,
      'border-style': this.borderStyle,
      'border-width': `${this.borderWidth}px`,
      'border-radius': `${this.borderRadius}px`,
      color: this.textColor,
      'font-family': this.fontFamily,
      'font-size': `${this.fontSize}px`,
      width: `${this.width}px`,
      height: `${this.height}px`,
    };
  }
  public getSectionContent(): SectionContent {
    const tableEl = this.tableContainer?.nativeElement;
    if (!tableEl) {
        return { contentData: '' };
    }
    let htmlContent = tableEl.innerHTML;

    // Appliquer display: block aux <td> pour forcer le retour à la ligne
    htmlContent = htmlContent.replace(/<td/g, '<td style="display: block;"');

    // Nettoyer les attributs Angular
    htmlContent = htmlContent.replace(/(_ngcontent-[a-zA-Z0-9-]+="")/g, '');

    return { contentData: htmlContent };
}
public applyContent(htmlContent: string): void {
  const tableEl = this.tableContainer?.nativeElement;
  if (tableEl) {
      tableEl.innerHTML = htmlContent;
      // Réappliquer les styles après avoir défini le contenu
      this.applyStyles(false);
  }
}
}