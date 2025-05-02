import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { StyleManagerService } from '../../../services/StyleManagerService';
import { Subscription } from 'rxjs';
import { Section } from '../../../models/section.model';

@Component({
  selector: 'app-logo',
  standalone: false,
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css']
})
export class LogoComponent implements Section, AfterViewInit, OnDestroy {
  @ViewChild('logoUploadContainer') logoContainer!: ElementRef<HTMLDivElement>;
  @Input() containerRef!: ElementRef<HTMLDivElement>;
  @Input() boundaryElement?: HTMLElement; // Match InfoClientComponent
  @Output() openOptions = new EventEmitter<string>();
  @Output() positionChanged = new EventEmitter<{ x: number, y: number }>();

  // Section interface properties
  id?: number;
  sectionName: string = 'logo';
  x: number = 20;
  y: number = 20;
  styles: { [key: string]: string } = {};

  // Style properties
  width = 160;
  height = 160;
  backgroundColor = '#ffffff';
  borderColor = '#cbd5e1';
  borderStyle = 'dashed';
  borderWidth = 1.8;
  borderRadius = 8;
  textColor = '#000000';
  fontFamily = 'Inter';
  fontSize = 16;

  imageUrl: string | null = null;
  private stylesSubscription!: Subscription;

  constructor(
    private translate: TranslateService,
    private styleManager: StyleManagerService
  ) {}

  ngAfterViewInit(): void {
    if (!this.boundaryElement) {
      console.warn('boundaryElement is not provided');
    }

    // Subscribe to style updates
    this.stylesSubscription = this.styleManager.componentStyles$.subscribe(styles => {
      const componentStyles = styles['logo'] || {};
      this.loadStyles(componentStyles);
      this.applyStyles(false); // Apply styles without updating service
    });

    // Load and apply initial styles
    const initialStyles = this.styleManager.getStyles('logo') || {};
    console.log('Initial styles:', initialStyles); // Debug: Verify initial styles
    this.loadStyles(initialStyles);
    this.applyStyles(false);

    // Apply initial position
    this.updateLogoPosition();
  }

  ngOnDestroy(): void {
    this.stylesSubscription?.unsubscribe();
  }

  private loadStyles(styles: { [key: string]: string | undefined }): void {
    this.width = this.parsePixelValue(styles['width'], this.width);
    this.height = this.parsePixelValue(styles['height'], this.height);
    this.backgroundColor = styles['background-color'] || this.backgroundColor;
    this.borderColor = styles['border-color'] || this.borderColor;
    this.borderStyle = styles['border-style'] || this.borderStyle;
    this.borderWidth = this.parsePixelValue(styles['border-width'], this.borderWidth);
    this.borderRadius = this.parsePixelValue(styles['border-radius'], this.borderRadius);
    this.textColor = styles['color'] || this.textColor;
    this.fontFamily = styles['font-family'] || this.fontFamily;
    this.fontSize = this.parsePixelValue(styles['font-size'], this.fontSize);
  }

  private parsePixelValue(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const num = parseFloat(value.replace(/px|\s/g, ''));
    return isNaN(num) ? defaultValue : num;
  }

  public applyStyles(updateService: boolean = true): void {
    const logoEl = this.logoContainer?.nativeElement;
    if (!logoEl) {
      console.warn('Logo container element not available for styling');
      return;
    }

    // Apply container styles
    logoEl.style.width = `${this.width}px`;
    logoEl.style.height = `${this.height}px`;
    logoEl.style.backgroundColor = this.backgroundColor;
    logoEl.style.border = `${this.borderWidth}px ${this.borderStyle} ${this.borderColor}`;
    logoEl.style.borderRadius = `${this.borderRadius}px`;

    // Apply text styles
    logoEl.querySelectorAll('.upload-subtitle, .change-image-btn').forEach((element: Element) => {
      const htmlEl = element as HTMLElement;
      htmlEl.style.color = this.textColor;
      htmlEl.style.fontFamily = this.fontFamily;
      htmlEl.style.fontSize = `${this.fontSize}px`;
    });

    // Update styles for Section interface
    this.styles = this.getCurrentStyles();

    // Update StyleManagerService if requested
    if (updateService) {
      this.styleManager.updateStyles('logo', this.styles, 'LogoComponent');
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file?.type.match('image.*')) {
      alert(this.translate.instant('Only images are accepted'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
      this.updateLogoPosition();
    };
    reader.readAsDataURL(file);
  }

  onDragEnd(event: CdkDragEnd): void {
    if (!this.boundaryElement) {
      console.warn('No boundaryElement available');
      return;
    }

    const logoElement = this.logoContainer.nativeElement;
    const containerRect = this.boundaryElement.getBoundingClientRect();
    const logoRect = logoElement.getBoundingClientRect();

    const newX = this.x + event.distance.x;
    const newY = this.y + event.distance.y;

    const minX = 0;
    const minY = 0;
    const maxX = containerRect.width - logoRect.width;
    const maxY = containerRect.height - logoRect.height;

    this.x = Math.max(minX, Math.min(newX, maxX));
    this.y = Math.max(minY, Math.min(newY, maxY));

    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });

    this.updateLogoPosition();
    this.positionChanged.emit({ x: this.x, y: this.y });

    // Optional: Persist position
    // this.styleManager.updatePosition('logo', { x: this.x, y: this.y }, 'LogoComponent');
  }

  public updateLogoPosition(): void {
    if (this.logoContainer?.nativeElement) {
      const element = this.logoContainer.nativeElement;
      element.style.left = `${this.x}px`;
      element.style.top = `${this.y}px`;
    }
  }

  getCurrentStyles(): { [key: string]: string } {
    return {
      'width': `${this.width}px`,
      'height': `${this.height}px`,
      'background-color': this.backgroundColor,
      'border-color': this.borderColor,
      'border-style': this.borderStyle,
      'border-width': `${this.borderWidth}px`,
      'border-radius': `${this.borderRadius}px`,
      'color': this.textColor,
      'font-family': this.fontFamily,
      'font-size': `${this.fontSize}px`
    };
  }

  openOptionsPanel(): void {
    this.openOptions.emit('logo');
  }
}