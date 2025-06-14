import { Component, Inject } from '@angular/core';
import { ModeleFacture } from '../../models/modele-facture.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModeleFactureService } from '../../services/ModeleFactureService';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { FactureServiceService } from '../../services/facture-service.service';

@Component({
  selector: 'app-model-selection-modal-component',
  standalone: false,
  templateUrl: './model-selection-modal-component.component.html',
  styleUrl: './model-selection-modal-component.component.css'
})
export class ModelSelectionModalComponentComponent {
  modeles: ModeleFacture[] = [];
  thumbnailUrls: { [key: number]: SafeUrl | string } = {};
  loadingThumbnails: { [key: number]: boolean } = {};
  loading: boolean = true;
  factureId: number | undefined; // Add factureId to store the invoice ID

  constructor(
    private dialogRef: MatDialogRef<ModelSelectionModalComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { factureId?: number }, // Expect factureId in dialog data
    private modeleFactureService: ModeleFactureService,
    private factureService: FactureServiceService, // Inject FactureService
    private toastr: ToastrService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer
  ) {
    this.factureId = data.factureId; // Initialize factureId from dialog data
  }

  ngOnInit(): void {
    this.loadModelesWithThumbnails();
  }

  loadModelesWithThumbnails(): void {
    this.loading = true;
    this.modeleFactureService.getAllModelesFacture().subscribe({
      next: (modeles: ModeleFacture[]) => {
        this.modeles = modeles.filter(modele => modele.id !== undefined);
        this.modeles.forEach((modele) => {
          if (modele.id) {
            this.loadingThumbnails[modele.id] = true;
            this.loadThumbnail(modele.id);
          }
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching modeles:', error);
        this.toastr.error(
          this.translate.instant('factures.ERROR.LOAD_MODELS_FAILED'),
          this.translate.instant('factures.ERROR.TITLE')
        );
      }
    });
  }

  loadThumbnail(id: number): void {
    console.log(`Loading thumbnail for model ID: ${id}`);
    this.modeleFactureService.getModeleThumbnail(id).subscribe({
      next: (blob) => {
        console.log(`Thumbnail received for ID ${id}:`, blob);
        if (blob.size > 0) {
          console.log(`Thumbnail size: ${blob.size} bytes, type: ${blob.type}`);
          const url = URL.createObjectURL(blob);
          this.thumbnailUrls[id] = this.sanitizer.bypassSecurityTrustUrl(url);
          console.log(`Generated URL for ID ${id}:`, url);
        } else {
          console.warn(`Empty thumbnail blob for ID ${id}`);
          this.thumbnailUrls[id] = '';
        }
        this.loadingThumbnails[id] = false;
      },
      error: (error) => {
        console.error(`Error loading thumbnail for ID ${id}:`, error);
        this.thumbnailUrls[id] = '';
        this.loadingThumbnails[id] = false;
      }
    });
  }

  getThumbnailUrl(modele: ModeleFacture): SafeUrl | string {
    return modele.id && this.thumbnailUrls[modele.id] ? this.thumbnailUrls[modele.id] : '';
  }

  isThumbnailLoading(modele: ModeleFacture): boolean {
    return modele.id ? this.loadingThumbnails[modele.id] || false : false;
  }

  selectModel(modelId: number | undefined): void {
    if (modelId !== undefined && this.factureId !== undefined) {
      this.factureService.updateFactureModele(this.factureId, modelId).subscribe({
        next: (updatedFacture) => {
          this.toastr.success(
            this.translate.instant('factures.SUCCESS.MODEL_UPDATED'),
            this.translate.instant('factures.SUCCESS.TITLE')
          );
          this.dialogRef.close(updatedFacture); // Return the updated facture
        },
        error: (error) => {
          console.error('Error updating facture model:', error);
          this.toastr.error(
            this.translate.instant('factures.ERROR.MODEL_UPDATE_FAILED'),
            this.translate.instant('factures.ERROR.TITLE')
          );
        }
      });
    } else {
      this.toastr.error(
        this.translate.instant('factures.ERROR.INVALID_SELECTION'),
        this.translate.instant('factures.ERROR.TITLE')
      );
    }
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  handleImageError(event: Event, modele: ModeleFacture): void {
    if (modele.id) {
      this.thumbnailUrls[modele.id] = '';
      this.loadingThumbnails[modele.id] = false;
    }
  }
}