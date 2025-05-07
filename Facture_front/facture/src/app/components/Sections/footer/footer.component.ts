import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { StyleManagerService } from '../../../services/StyleManagerService';
import { Subscription } from 'rxjs';
import { Section, SectionContent } from '../../../models/section.model';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements Section, AfterViewInit, OnDestroy {
  @ViewChild('footerContainer') footerContainer!: ElementRef<HTMLDivElement>;
  @Input() containerRef?: ElementRef<HTMLDivElement>;
  @Input() boundaryElement?: HTMLElement;
  @Input() componentId: string = 'footer';
  @Output() openOptions = new EventEmitter<string>();
  @Output() positionChanged = new EventEmitter<{ x: number; y: number }>();

  // Section interface properties
  id?: number;
  sectionName: string = 'footer';
  x: number = 20;
  y: number = 850;
  styles: { [key: string]: string } = {};

  // Style properties
  backgroundColor = '#ffffff';
  textColor = '#000000';
  fontFamily = 'Inter';
  fontSize = 16;
  borderWidth = 1.8;
  borderStyle = 'dashed';
  borderColor = '#cbd5e1';
  borderRadius = 4;
  width = 750; // From footer.component.css
  height = 170; // Inferred from .footer-input height

  private stylesSubscription!: Subscription;

  constructor(
    private styleManager: StyleManagerService,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    if (!this.boundaryElement) {
      console.warn('boundaryElement is not provided, using containerRef');
      this.boundaryElement = this.containerRef?.nativeElement;
    }

    // Subscribe to style updates
    this.stylesSubscription = this.styleManager.componentStyles$.subscribe(styles => {
      const componentStyles = styles[this.componentId] || {};
      this.loadStyles(componentStyles);
      this.applyStyles(false); // Apply styles without updating service
    });


    // Apply initial position
    this.updateFooterPosition();
  }

  ngOnDestroy(): void {
    this.stylesSubscription?.unsubscribe();
  }

  private loadStyles(styles: { [key: string]: string | undefined }) {
    this.backgroundColor = styles['background-color'] || this.backgroundColor;
    this.textColor = styles['color'] || this.textColor;
    this.fontFamily = styles['font-family'] || this.fontFamily;
    this.fontSize = this.parsePixelValue(styles['font-size'], this.fontSize);
    this.borderWidth = this.parsePixelValue(styles['border-width'], this.borderWidth);
    this.borderStyle = styles['border-style'] || this.borderStyle;
    this.borderColor = styles['border-color'] || this.borderColor;
    this.borderRadius = this.parsePixelValue(styles['border-radius'], this.borderRadius);
    this.width = this.parsePixelValue(styles['width'], this.width);
    this.height = this.parsePixelValue(styles['height'], this.height);
  }

  private parsePixelValue(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const num = parseFloat(value.replace(/px|\s/g, ''));
    return isNaN(num) ? defaultValue : num;
  }

  public applyStyles(updateService: boolean = true) {
    const footerEl = this.footerContainer?.nativeElement;
    if (!footerEl) {
      console.warn('Footer container element not available for styling');
      return;
    }

    // Apply container styles
    this.renderer.setStyle(footerEl, 'background-color', this.backgroundColor);
    this.renderer.setStyle(footerEl, 'border', `${this.borderWidth}px ${this.borderStyle} ${this.borderColor}`);
    this.renderer.setStyle(footerEl, 'border-radius', `${this.borderRadius}px`);
    this.renderer.setStyle(footerEl, 'width', `${this.width}px`);
    this.renderer.setStyle(footerEl, 'height', `${this.height}px`);
    this.renderer.setStyle(footerEl, 'padding', '15px');
    this.renderer.setStyle(footerEl, 'margin', '10px 0');

    // Apply text styles
    footerEl.querySelectorAll('.footer-section, .footer-title, .footer-text').forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      this.renderer.setStyle(htmlEl, 'color', this.textColor);
      this.renderer.setStyle(htmlEl, 'font-family', this.fontFamily);
      this.renderer.setStyle(htmlEl, 'font-size', `${this.fontSize}px`);
      this.renderer.setStyle(htmlEl, 'margin', '5px 0');
    });

    // Update styles for Section interface
    this.styles = this.getCurrentStyles();

    // Update StyleManagerService if requested
    if (updateService) {
      this.styleManager.updateStyles(this.componentId, this.styles, 'FooterComponent');
    }
  }

  onDragEnd(event: CdkDragEnd): void {
    if (!this.boundaryElement || !this.footerContainer?.nativeElement) {
      console.warn('No boundaryElement or footerContainer available');
      return;
    }

    const boundaryRect = this.boundaryElement.getBoundingClientRect();
    const footerRect = this.footerContainer.nativeElement.getBoundingClientRect();

    const newX = this.x + event.distance.x;
    const newY = this.y + event.distance.y;

    this.x = Math.max(0, Math.min(newX, boundaryRect.width - footerRect.width));
    this.y = Math.max(0, Math.min(newY, boundaryRect.height - footerRect.height));

    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });

    this.updateFooterPosition();
    this.positionChanged.emit({ x: this.x, y: this.y });

    // Optional: Persist position
    // this.styleManager.updatePosition(this.componentId, { x: this.x, y: this.y }, 'FooterComponent');
  }

  public updateFooterPosition(): void {
    const element = this.footerContainer?.nativeElement;
    if (element) {
      this.renderer.setStyle(element, 'left', `${this.x}px`);
      this.renderer.setStyle(element, 'top', `${this.y}px`);
    }
  }

  getCurrentStyles(): { [key: string]: string } {
    return {
      'background-color': this.backgroundColor,
      'color': this.textColor,
      'font-family': this.fontFamily,
      'font-size': `${this.fontSize}px`,
      'border-width': `${this.borderWidth}px`,
      'border-style': this.borderStyle,
      'border-color': this.borderColor,
      'border-radius': `${this.borderRadius}px`,
      'width': `${this.width}px`,
      'height': `${this.height}px`
    };
  }

  openOptionsPanel(): void {
    this.openOptions.emit(this.componentId);
  }
  public getSectionContent(): SectionContent {
    const tableEl = this.footerContainer?.nativeElement;
    if (!tableEl) {
        return { contentData: '' };
    }
    let htmlContent = tableEl.innerHTML;
    // Nettoyer les attributs Angular si nécessaire
    htmlContent = htmlContent.replace(/(_ngcontent-[a-zA-Z0-9-]+="")/g, '');
    return { contentData: htmlContent };
}
}