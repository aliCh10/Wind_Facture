import { Component, OnInit } from '@angular/core';
import { ModeleFactureService } from '../services/ModeleFactureService';
import { ModeleFacture } from '../models/modele-facture.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-new-facture',
  standalone: false,
  templateUrl: './new-facture.component.html',
  styleUrls: ['./new-facture.component.css']
})
export class NewFactureComponent implements OnInit {
  modeles: ModeleFacture[] = [];
  loading = true;
  searchTerm = '';
  hoveredModele: { id: number | null, thumbnailUrl: string | null } = { id: null, thumbnailUrl: null };

  constructor(
    private modeleFactureService: ModeleFactureService,
    private router: Router,
    private toastr: ToastrService,
    private translate: TranslateService,
    private dialogService: DialogService // Injecter DialogService
    
  ) {}

  ngOnInit(): void {
    this.loadModeles();
  }

  loadModeles(): void {
    this.loading = true;
    this.modeleFactureService.getAllModelesFacture().subscribe({
      next: (modeles) => {
        this.modeles = modeles;
        this.loading = false;
      },
      error: (error) => {
        console.error(this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_TEMPLATES.TEXT'), error);
        this.loading = false;
        this.toastr.error(
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_TEMPLATES.TEXT'),
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_TEMPLATES.TITLE')
        );
      }
    });
  }
  

  openModelePreview(modele: ModeleFacture): void {
    if (!modele.id) return;
  
    this.modeleFactureService.getModelePdf(modele.id).subscribe(
      (pdfBlob: Blob) => {
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      },
      error => {
        console.error(this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_PDF.TEXT'), error);
        this.toastr.error(
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_PDF.TEXT'),
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_PDF.TITLE')
        );
      }
    );
  }

  createNewModele(): void {
    this.router.navigate(['/modele']);
  }

  get filteredModeles(): ModeleFacture[] {
    return (this.modeles || []).filter(modele =>
      modele.nameModel.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

 deleteModele(modele: ModeleFacture, event: Event): void {
  event.stopPropagation();
  const modeleId = modele.id;
  
  if (!modeleId) {
    console.error(this.translate.instant('INVOICE_TEMPLATES.MESSAGES.CANNOT_DELETE_NO_ID.TEXT'));
    this.toastr.error(
      this.translate.instant('INVOICE_TEMPLATES.MESSAGES.CANNOT_DELETE_NO_ID.TEXT'),
      this.translate.instant('INVOICE_TEMPLATES.MESSAGES.CANNOT_DELETE_NO_ID.TITLE')
    );
    return;
  }

  this.dialogService
    .openConfirmDialog({
      title: this.translate.instant('factures.CONFIRM.DELETE_TITLE'),
      message: this.translate.instant('INVOICE_TEMPLATES.MESSAGES.CONFIRM_DELETE', { name: modele.nameModel }),
      cancelText: this.translate.instant('factures.CONFIRM.CANCEL'),
      confirmText: this.translate.instant('factures.CONFIRM.OK')
    })
    .subscribe((result) => {
      if (result) {
        this.modeleFactureService.deleteModeleFacture(modeleId).subscribe({
          next: () => {
            this.modeles = this.modeles.filter(m => m.id !== modeleId);
            this.toastr.success(
              this.translate.instant('INVOICE_TEMPLATES.MESSAGES.TEMPLATE_DELETED.TEXT'),
              this.translate.instant('INVOICE_TEMPLATES.MESSAGES.TEMPLATE_DELETED.TITLE')
            );
          },
          error: (error) => {
            console.error(this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_DELETE_TEMPLATE.TEXT'), error);
            this.toastr.error(
              this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_DELETE_TEMPLATE.TEXT'),
              this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_DELETE_TEMPLATE.TITLE')
            );
          }
        });
      }
    });
}
  onModeleHover(modele: ModeleFacture): void {
  if (!modele.id || this.hoveredModele.id === modele.id) return;

  this.hoveredModele.id = modele.id;
  this.hoveredModele.thumbnailUrl = null;

  this.modeleFactureService.getModeleThumbnail(modele.id).subscribe(
    (thumbnailBlob: Blob) => {
      this.hoveredModele.thumbnailUrl = URL.createObjectURL(thumbnailBlob);
    },
    error => {
      console.error('Failed to load thumbnail:', error);
      this.hoveredModele.thumbnailUrl = null;
    }
  );
}

// Ajoutez cette méthode pour nettoyer quand on quitte le survol
onModeleLeave(): void {
  if (this.hoveredModele.thumbnailUrl) {
    URL.revokeObjectURL(this.hoveredModele.thumbnailUrl);
  }
  this.hoveredModele = { id: null, thumbnailUrl: null };
}
}