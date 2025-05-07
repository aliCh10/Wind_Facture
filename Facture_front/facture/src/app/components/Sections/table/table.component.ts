import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';
import { StyleManagerService } from '../../../services/StyleManagerService';
import { Subscription } from 'rxjs';
import { Section, SectionContent } from '../../../models/section.model';

interface TableItem {
  ref: string;
  tva: number;
  remise: number;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  standalone: false,
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements Section, AfterViewInit, OnDestroy {
  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLDivElement>;
  @Input() containerRef?: ElementRef<HTMLDivElement>;
  @Input() boundaryElement?: HTMLElement;
  @Output() openOptions = new EventEmitter<string>();
  @Output() positionChanged = new EventEmitter<{ x: number; y: number }>();

  hoveredIndex: number | null = null;
  items: TableItem[] = [{ ref: '', tva: 20, remise: 0, quantity: 1, price: 0 }];

  // Section interface properties
  id?: number;
  sectionName: string = 'tableContainer';
  x: number = 20;
  y: number = 550;
  styles: { [key: string]: string } = {};

  // Style properties
  backgroundColor = '#FFD700';
  borderColor = '#cbd5e1';
  borderStyle = 'dashed';
  borderWidth = 1.8;
  borderRadius = 8;
  textColor = '#000000';
  fontFamily = 'Inter';
  fontSize = 14;
  width = 750; // Consistent with FooterComponent and CalendarComponent
  height = 220; // Suitable for table content (adjust as needed)

  private stylesSubscription!: Subscription;

  constructor(
    private styleManager: StyleManagerService,
    private renderer: Renderer2
  ) {}
  

  ngAfterViewInit() {
    if (!this.boundaryElement) {
      console.warn('boundaryElement is not provided, using containerRef');
      this.boundaryElement = this.containerRef?.nativeElement;
    }

    // Subscribe to style updates
    this.stylesSubscription = this.styleManager.componentStyles$.subscribe(styles => {
      const componentStyles = styles['table'] || {};
      this.loadStyles(componentStyles);
      this.applyStyles(false); // Apply styles without updating service
    });

    // Load and apply initial styles

    // Apply initial position
    this.updateTablePosition();
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
    if (!this.tableContainer?.nativeElement) {
      console.warn('Table container element not available for styling');
      return;
    }

    const tableEl = this.tableContainer.nativeElement;

    // Container styles
    this.renderer.setStyle(tableEl, 'border', `${this.borderWidth}px ${this.borderStyle} ${this.borderColor}`);
    this.renderer.setStyle(tableEl, 'borderRadius', `${this.borderRadius}px`);
    this.renderer.setStyle(tableEl, 'width', `${this.width}px`);
    this.renderer.setStyle(tableEl, 'height', `${this.height}px`);

    // Header styles
    tableEl.querySelectorAll('thead tr').forEach(header => {
      this.renderer.setStyle(header, 'backgroundColor', this.backgroundColor);
      this.renderer.setStyle(header, 'color', this.textColor);
    });

    // Add button styles
    const addButton = tableEl.querySelector('button');
    if (addButton) {
      this.renderer.setStyle(addButton, 'backgroundColor', this.backgroundColor);
      this.renderer.setStyle(addButton, 'color', this.textColor);
      this.renderer.setStyle(addButton, 'fontFamily', this.fontFamily);
      this.renderer.setStyle(addButton, 'fontSize', `${this.fontSize}px`);
    }

    // Total text styles
    const totalText = tableEl.querySelector('.text-base.font-semibold');
    if (totalText) {
      this.renderer.setStyle(totalText, 'color', this.textColor);
      this.renderer.setStyle(totalText, 'fontFamily', this.fontFamily);
      this.renderer.setStyle(totalText, 'fontSize', `${this.fontSize}px`);
    }

    // Table header cells
    tableEl.querySelectorAll('th').forEach(cell => {
      this.renderer.setStyle(cell, 'color', this.textColor);
      this.renderer.setStyle(cell, 'fontFamily', this.fontFamily);
      this.renderer.setStyle(cell, 'fontSize', `${this.fontSize}px`);
    });

    // Input fields
    tableEl.querySelectorAll('input').forEach(input => {
      this.renderer.setStyle(input, 'color', this.textColor);
      this.renderer.setStyle(input, 'fontFamily', this.fontFamily);
      this.renderer.setStyle(input, 'fontSize', `${this.fontSize}px`);
    });

    // Update styles for Section interface
    this.styles = this.getCurrentStyles();

    // Update StyleManagerService if requested
    if (updateService) {
      this.styleManager.updateStyles('table', this.styles, 'TableComponent');
    }
  }

  addItem() {
    this.items.push({ ref: '', tva: 20, remise: 0, quantity: 1, price: 0 });
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
    }
  }

  onDragEnd(event: CdkDragEnd) {
    if (!this.boundaryElement) {
      console.warn('No boundaryElement available');
      return;
    }

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

    this.updateTablePosition();
    this.positionChanged.emit({ x: this.x, y: this.y });

    // Optional: Persist position
    // this.styleManager.updatePosition('table', { x: this.x, y: this.y }, 'TableComponent');
  }

  public updateTablePosition() {
    if (this.tableContainer?.nativeElement) {
      const tableElement = this.tableContainer.nativeElement;
      this.renderer.setStyle(tableElement, 'left', `${this.x}px`);
      this.renderer.setStyle(tableElement, 'top', `${this.y}px`);
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
    const contentEl = this.tableContainer?.nativeElement;
    if (!contentEl) {
        return { contentData: '' };
    }

    // Clone the table container
    const clonedEl = contentEl.cloneNode(true) as HTMLElement;

    // Remove all <button> elements
    const buttons = clonedEl.querySelectorAll('button');
    buttons.forEach(button => {
        const parent = button.closest('td') || button.closest('div');
        if (parent) {
            parent.remove();
        }
    });

    // Get the cleaned HTML content
    let htmlContent = clonedEl.innerHTML;
    htmlContent = htmlContent.replace(/(_ngcontent-[a-zA-Z0-9-]+="")/g, '');

    return { contentData: htmlContent };
}
  openOptionsPanel() {
    this.openOptions.emit('table');
  }
}