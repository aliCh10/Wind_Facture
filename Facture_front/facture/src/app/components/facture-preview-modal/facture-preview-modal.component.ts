import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModeleFacture,  } from '../../models/modele-facture.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Section } from '../../models/section.model';

@Component({
  selector: 'app-facture-preview-modal',
  standalone: false,
  templateUrl: './facture-preview-modal.component.html',
  styleUrls: ['./facture-preview-modal.component.css']
})
export class FacturePreviewModalComponent {
  private readonly mmToPx = 96 / 25.4;
  readonly originalA4Width = 210 * this.mmToPx;
  readonly originalA4Height = 297 * this.mmToPx;

  scaleFactor = 0.7;
  readonly minScale = 0.5;
  readonly maxScale = 1.5;
  readonly zoomStep = 0.1;

  constructor(
    public dialogRef: MatDialogRef<FacturePreviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { modeleFacture: ModeleFacture },
    private sanitizer: DomSanitizer
  ) {}

  get modeleFacture(): ModeleFacture {
    return this.data.modeleFacture || { nameModel: '', sections: [] };
  }

  zoomIn(): void {
    this.scaleFactor = Math.min(this.scaleFactor + this.zoomStep, this.maxScale);
  }

  zoomOut(): void {
    this.scaleFactor = Math.max(this.scaleFactor - this.zoomStep, this.minScale);
  }

  resetZoom(): void {
    this.scaleFactor = 0.7;
  }

  close(): void {
    this.dialogRef.close();
  }

  useTemplate(): void {
    this.dialogRef.close('use');
  }

  getStyles(section: Section): { [key: string]: string | number } {
    const styles = { ...section.styles }; // Remove || {}
  
    // Prevent background-color from applying to tableContainer
    if (section.sectionName === 'tableContainer') {
      delete styles['background-color'];
    }
  
    return {
      position: 'absolute',
      left: `${section.x ?? 0}px`,
      top: `${section.y ?? 0}px`,
      ...styles
    };
  }

  getSafeHtml(contentData: string): SafeHtml {
    if (!contentData) {
      console.warn('Empty contentData received for section');
    }
    return this.sanitizer.bypassSecurityTrustHtml(contentData || '');
  }
}