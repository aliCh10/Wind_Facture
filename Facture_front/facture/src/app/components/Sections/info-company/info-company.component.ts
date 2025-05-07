import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { StyleManagerService } from '../../../services/StyleManagerService';
import { Subscription } from 'rxjs';
import { Section, SectionContent } from '../../../models/section.model';

@Component({
  selector: 'app-info-company',
  standalone: false,
  templateUrl: './info-company.component.html',
  styleUrls: ['./info-company.component.css']
})
export class InfoCompanyComponent implements Section, AfterViewInit, OnDestroy {
  @ViewChild('companyContainer') companyContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('companyForm') companyForm!: ElementRef<HTMLDivElement>;
  @Input() boundaryElement?: HTMLElement;
  @Input() containerRef!: ElementRef<HTMLDivElement>;
  @Output() openOptions = new EventEmitter<string>();

  companyInfo = {
    name: 'SCI Wind',
    address: '85 RUE D\'AURIASQUE, 83600 FREJUS, FR',
    phone: '',
    email: '',
    siret: ''
  };

  // Section interface properties
  id?: number;
  sectionName: string = 'info-company';
  x: number = 20;
  y: number = 210;
  styles: { [key: string]: string } = {};

  // Style properties
  backgroundColor = '#ffffff';
  borderColor = '#cbd5e1';
  borderStyle = 'dashed';
  borderWidth = 1.8;
  borderRadius = 4;
  textColor = '#000000';
  fontFamily = 'Inter';
  fontSize = 16;
  width = 300;
  height = 100;

  private stylesSubscription!: Subscription;

  constructor(private styleManager: StyleManagerService) {}

  ngAfterViewInit() {
    // Subscribe to style updates
    this.stylesSubscription = this.styleManager.componentStyles$.subscribe(styles => {
      const componentStyles = styles['info-company'] || {};
      this.loadStyles(componentStyles);
      this.applyStyles(false); // Apply styles without updating service
    });

    // Apply initial position
    this.updateCompanyPosition();
  }

  ngOnDestroy() {
    this.stylesSubscription?.unsubscribe();
  }

  private loadStyles(styles: { [key: string]: string | undefined }): void {
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

  public applyStyles(updateService: boolean = true): void {
    const containerEl = this.companyContainer?.nativeElement;
    const formEl = this.companyForm?.nativeElement;
    if (!containerEl || !formEl) {
      console.warn('Container or form element not available for styling');
      return;
    }

    // Apply container styles
    containerEl.style.backgroundColor = this.backgroundColor;
    containerEl.style.border = `${this.borderWidth}px ${this.borderStyle} ${this.borderColor}`;
    containerEl.style.borderRadius = `${this.borderRadius}px`;
    containerEl.style.width = `${this.width}px`;
    containerEl.style.height = `${this.height}px`;

    // Apply text styles
    formEl.style.color = this.textColor;
    formEl.style.fontFamily = this.fontFamily;
    formEl.style.fontSize = `${this.fontSize}px`;

    // Update styles for Section interface
    this.styles = this.getCurrentStyles();

    // Update StyleManagerService if requested
    if (updateService) {
      this.styleManager.updateStyles('info-company', this.styles, 'InfoCompanyComponent');
    }
  }

  onDragEnd(event: CdkDragEnd): void {
    if (!this.boundaryElement) {
      console.warn('No boundaryElement available');
      return;
    }

    const element = this.companyContainer.nativeElement;
    const containerRect = this.boundaryElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const newX = this.x + event.distance.x;
    const newY = this.y + event.distance.y;

    this.x = Math.max(0, Math.min(newX, containerRect.width - elementRect.width));
    this.y = Math.max(0, Math.min(newY, containerRect.height - elementRect.height));

    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });

    this.updateCompanyPosition();

    // Optional: Persist position
    // this.styleManager.updatePosition('info-company', { x: this.x, y: this.y }, 'InfoCompanyComponent');
  }

  public updateCompanyPosition(): void {
    if (this.companyContainer?.nativeElement) {
      const element = this.companyContainer.nativeElement;
      element.style.left = `${this.x}px`;
      element.style.top = `${this.y}px`;
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
      const tableEl = this.companyContainer?.nativeElement;
      if (!tableEl) {
          return { contentData: '' };
      }
      let htmlContent = tableEl.innerHTML;
      // Nettoyer les attributs Angular si nécessaire
      htmlContent = htmlContent.replace(/(_ngcontent-[a-zA-Z0-9-]+="")/g, '');
      return { contentData: htmlContent };
  }

  openOptionsPanel() {
    this.openOptions.emit('info-company');
  }
}