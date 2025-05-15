import { Component, OnInit } from '@angular/core';
import { ModeleFactureService } from '../services/ModeleFactureService';
import { ModeleFacture } from '../models/modele-facture.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService
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
        console.error('Error loading templates', error);
        this.loading = false;
        this.toastr.error('Failed to load templates', 'Error');
      }
    });
  }

  openModelePreview(modele: ModeleFacture): void {
    if (!modele.id) return;
  
    this.modeleFactureService.getModelePdf(modele.id).subscribe(
      (pdfBlob: Blob) => {
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
        // Optional: Revoke the blob URL after some time
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      },
      error => {
        console.error('PDF loading error:', error);
        this.toastr.error('Failed to load PDF', 'Error');
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
      console.error('Cannot delete template - no ID provided');
      this.toastr.error('Cannot delete template - missing ID', 'Error');
      return;
    }

    if (confirm(`Are you sure you want to delete "${modele.nameModel}"?`)) {
      this.modeleFactureService.deleteModeleFacture(modele.id).subscribe({
        next: () => {
          this.modeles = this.modeles.filter(m => m.id !== modele.id);
          this.toastr.success('Template deleted successfully', 'Success');
        },
        error: (error) => {
          console.error('Error deleting template', error);
          this.toastr.error('Failed to delete template', 'Error');
        }
      });
    }
  }
}