import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModeleFacture } from '../../models/modele-facture.model';

@Component({
  selector: 'app-facture-preview-modal',
  standalone: false,
  templateUrl: './facture-preview-modal.component.html',
  styleUrls: ['./facture-preview-modal.component.css']
})
export class FacturePreviewModalComponent {
  // A4 dimensions in pixels (assuming 96dpi: 210mm = 793.7px, 297mm = 1122.5px)
  private mmToPx = 96 / 25.4; // Conversion factor
  originalA4Width = 210 * this.mmToPx; // 793.7px
  originalA4Height = 297 * this.mmToPx; // 1122.5px
  scaleFactor = 0.7; // Scale to 70% of original size

  constructor(
    public dialogRef: MatDialogRef<FacturePreviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { modeleFacture: ModeleFacture }
  ) {}

  get modeleFacture(): ModeleFacture {
    return this.data.modeleFacture;
  }

  close(): void {
    this.dialogRef.close();
  }

  useTemplate(): void {
    this.dialogRef.close('use');
  }

  getOriginalStyles(section: any): any {
    return {
      position: 'absolute',
      left: `${section.x}px`,
      top: `${section.y}px`,
      ...section.styles // Apply all original styles (width, height, border, etc.)
    };
  }
}