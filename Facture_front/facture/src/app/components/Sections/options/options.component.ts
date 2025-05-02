// options.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { StyleManagerService } from '../../../services/StyleManagerService';

interface FontOption {
  value: string;
  display: string;
}

@Component({
  selector: 'app-options',
  standalone:false,
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
})
export class OptionsComponent implements OnInit, OnChanges {
  @Input() activeComponent: string = '';
  @Output() stylesUpdated = new EventEmitter<{component: string, styles: any}>();

  // Style properties
  backgroundColor = '#ffffff';
  textColor = '#000000';
  fontOptions: FontOption[] = [
    { value: 'Inter', display: 'Inter' },
    { value: 'Roboto', display: 'Roboto' },
    { value: 'Arial', display: 'Arial' },
    { value: 'Poppins', display: 'Poppins' },
  ];
  selectedFont = 'Inter';
  fontSize = 16;
  borderColor = '#cbd5e1';
  borderStyle = 'dashed';
  borderWidth = 1.8;
  borderRadius = 4;

  constructor(private styleManager: StyleManagerService,  private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCurrentStyles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeComponent']) {
      this.loadCurrentStyles();
    }
  }

  loadCurrentStyles() {
    if (!this.activeComponent) return;
    
    const styles = this.styleManager.getStyles(this.activeComponent);
    
    // Use spread operator to create new references which helps with change detection
    this.backgroundColor = styles['background-color'] || this.backgroundColor;
    this.textColor = styles['color'] || this.textColor;
    this.selectedFont = styles['font-family'] || this.selectedFont;
    
    // Force number type for slider values
    this.fontSize = +this.parsePixelValue(styles['font-size'], this.fontSize);
    this.borderColor = styles['border-color'] || this.borderColor;
    this.borderStyle = styles['border-style'] || this.borderStyle;
    this.borderWidth = +this.parsePixelValue(styles['border-width'], this.borderWidth);
    this.borderRadius = +this.parsePixelValue(styles['border-radius'], this.borderRadius);
    
    // Trigger change detection explicitly if needed
    this.changeDetector.detectChanges();
  }

  private parsePixelValue(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    
    if (typeof value === 'number') return value;
    
    const num = parseFloat(value.toString().replace(/px|\s/g, ''));
    return isNaN(num) ? defaultValue : num;
  }
  updateStyles() {
    const styles = {
      'background-color': this.backgroundColor,
      'color': this.textColor,
      'font-family': this.selectedFont,
      'font-size': `${this.fontSize}px`,
      'border-color': this.borderColor,
      'border-style': this.borderStyle,
      'border-width': `${this.borderWidth}px`,
      'border-radius': `${this.borderRadius}px`,
    };

    // Émettre les changements
    this.stylesUpdated.emit({
      component: this.activeComponent,
      styles: styles
    });
    
    // Mettre à jour via le service
    this.styleManager.updateStyles(this.activeComponent, styles);
  }
}