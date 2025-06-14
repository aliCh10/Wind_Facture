import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StyleManagerService } from '../../../services/StyleManagerService';
import { Section, SectionContent } from '../../../models/section.model';

@Component({
  selector: 'app-calendar',
  standalone: false,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements Section, AfterViewInit, OnDestroy {
  @ViewChild('calendarContainer') calendarContainer!: ElementRef<HTMLDivElement>;
  @Input() containerRef?: ElementRef<HTMLDivElement>;
  @Input() boundaryElement?: HTMLElement;
  @Output() openOptions = new EventEmitter<string>();
  @Output() positionChanged = new EventEmitter<{ x: number; y: number }>();

  selectedDate1: Date | null = new Date(2025, 3, 10); // Date d'émission
  selectedDate2: Date | null = new Date(2025, 4, 10); // Règlement
  selectedOption = 'Facture';
  options = ['Facture', 'Devis', 'Bon de commande'];

  // Section interface properties
  id?: number;
  sectionName: string = 'calendar';
  x: number = 20;
  y: number = 320;
  styles: { [key: string]: string } = {};

  // Style properties
  backgroundColor = '#ffffff';
  borderColor = '#cbd5e1';
  borderStyle = 'dashed';
  borderWidth = 1.8;
  borderRadius = 12;
  textColor = '#000000';
  fontFamily = 'Inter';
  fontSize = 14;
width = 300;  // Largeur réduite
height = 70; // Hauteur réduite

  private stylesSubscription!: Subscription;

  constructor(private styleManager: StyleManagerService) {}

  ngAfterViewInit() {
    if (!this.boundaryElement) {
      console.warn('boundaryElement is not provided, using containerRef');
      this.boundaryElement = this.containerRef?.nativeElement;
    }

    // Subscribe to style updates
    this.stylesSubscription = this.styleManager.componentStyles$.subscribe(styles => {
      const componentStyles = styles['calendar'] || {};
      this.loadStyles(componentStyles);
      this.applyStyles(false); // Apply styles without updating service
    });

    // Apply initial position
    this.updateCalendarPosition();
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
    const el = this.calendarContainer?.nativeElement;
    if (!el) {
      console.warn('Calendar container element not available for styling');
      return;
    }

    // Apply container styles
    el.style.backgroundColor = this.backgroundColor;
    el.style.border = `${this.borderWidth}px ${this.borderStyle} ${this.borderColor}`;
    el.style.borderRadius = `${this.borderRadius}px`;
    el.style.width = `${this.width}px`;
    el.style.height = `${this.height}px`;

    // Apply text styles
    el.querySelectorAll('mat-label, mat-select, input, mat-option, .mat-select-value, .mat-select-arrow').forEach(
      (element: Element) => {
        const htmlEl = element as HTMLElement;
        htmlEl.style.color = this.textColor;
        htmlEl.style.fontFamily = this.fontFamily;
        htmlEl.style.fontSize = `${this.fontSize}px`;
      }
    );

    // Update styles for Section interface
    this.styles = this.getCurrentStyles();

    // Update StyleManagerService if requested
    if (updateService) {
      this.styleManager.updateStyles('calendar', this.styles, 'CalendarComponent');
    }
  }

  onDragEnd(event: CdkDragEnd): void {
    if (!this.boundaryElement) {
      console.warn('No boundaryElement available');
      return;
    }

    const el = this.calendarContainer.nativeElement;
    const containerRect = this.boundaryElement.getBoundingClientRect();
    const elementRect = el.getBoundingClientRect();

    const newX = this.x + event.distance.x;
    const newY = this.y + event.distance.y;

    this.x = Math.max(0, Math.min(newX, containerRect.width - elementRect.width));
    this.y = Math.max(0, Math.min(newY, containerRect.height - elementRect.height));

    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });

    this.updateCalendarPosition();
    this.positionChanged.emit({ x: this.x, y: this.y });
  }

  public updateCalendarPosition(): void {
    if (this.calendarContainer?.nativeElement) {
      const calendarElement = this.calendarContainer.nativeElement;
      calendarElement.style.left = `${this.x}px`;
      calendarElement.style.top = `${this.y}px`;
    }
  }

  getCurrentStyles(): { [key: string]: string } {
    return {
      'background-color': this.backgroundColor,
      'border-color': this.borderColor,
      'border-style': this.borderStyle,
      'border-width': `${this.borderWidth}px`,
      'border-radius': `${this.borderRadius}px`,
      'color': this.textColor,
      'font-family': this.fontFamily,
      'font-size': `${this.fontSize}px`,
      'width': `${this.width}px`,
      'height': `${this.height}px`
    };
  }

  public getSectionContent(): SectionContent {
    const containerStyle = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: absolute;
        left: ${this.x}px;
        top: ${this.y}px;
        width: ${this.width}px;
        height: ${this.height}px;
        background-color: ${this.backgroundColor};
        border: ${this.borderWidth}px ${this.borderStyle} ${this.borderColor};
        border-radius: ${this.borderRadius}px;
        padding: 10px;
    `;

    const spanStyle = `
        color: ${this.textColor};
        font-family: ${this.fontFamily};
        font-size: ${this.fontSize}px;
        font-weight: normal;
    `;

    let htmlContent = `<div style="${containerStyle}">`;

    // Add creationDate placeholder
    htmlContent += `
        <div>
            <span style="${spanStyle}" data-placeholder="#creationDate">
                ${this.selectedDate1 ? this.formatDate(this.selectedDate1) : '#creationDate'}
            </span>
        </div>
    `;

    // Add dueDate placeholder
    htmlContent += `
        <div>
            <span style="${spanStyle}" data-placeholder="#dueDate">
                ${this.selectedDate2 ? this.formatDate(this.selectedDate2) : '#dueDate'}
            </span>
        </div>
    `;

    htmlContent += `</div>`;

    return { contentData: htmlContent };
}

private formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

  openOptionsPanel() {
    this.openOptions.emit('calendar');
  }
}