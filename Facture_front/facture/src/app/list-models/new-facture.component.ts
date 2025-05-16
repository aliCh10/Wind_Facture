import { Component, OnInit } from '@angular/core';
import { ModeleFactureService } from '../services/ModeleFactureService';
import { ModeleFacture } from '../models/modele-facture.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private modeleFactureService: ModeleFactureService,
    private router: Router,
    private toastr: ToastrService,
    private translate: TranslateService
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
    if (!modele.id) {
      console.error(this.translate.instant('INVOICE_TEMPLATES.MESSAGES.CANNOT_DELETE_NO_ID.TEXT'));
      this.toastr.error(
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.CANNOT_DELETE_NO_ID.TEXT'),
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.CANNOT_DELETE_NO_ID.TITLE')
      );
      return;
    }

    const confirmMessage = this.translate.instant('INVOICE_TEMPLATES.MESSAGES.CONFIRM_DELETE', { name: modele.nameModel });
    if (confirm(confirmMessage)) {
      this.modeleFactureService.deleteModeleFacture(modele.id).subscribe({
        next: () => {
          this.modeles = this.modeles.filter(m => m.id !== modele.id);
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
  }
}