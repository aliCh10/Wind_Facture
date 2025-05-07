import { Component, OnInit } from '@angular/core';
import { ModeleFactureService } from '../services/ModeleFactureService';
import { ModeleFacture } from '../models/modele-facture.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar
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
        this.snackBar.open('Failed to load templates', 'Close', { duration: 3000 });
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
        this.snackBar.open('Failed to load PDF', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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
      this.snackBar.open('Cannot delete template - missing ID', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${modele.nameModel}"?`)) {
      this.modeleFactureService.deleteModeleFacture(modele.id).subscribe({
        next: () => {
          this.modeles = this.modeles.filter(m => m.id !== modele.id);
          this.snackBar.open('Template deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error deleting template', error);
          this.snackBar.open('Failed to delete template', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}