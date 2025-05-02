import { Component, OnInit } from '@angular/core';
import { ModeleFactureService } from '../services/ModeleFactureService';
import { ModeleFacture } from '../models/modele-facture.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FacturePreviewModalComponent } from '../components/facture-preview-modal/facture-preview-modal.component';

@Component({
  selector: 'app-new-facture',
  standalone:false,
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
    private dialog: MatDialog
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
      }
    });
  }

  openModelePreview(modele: ModeleFacture): void {
    const dialogRef = this.dialog.open(FacturePreviewModalComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '100vh',
      data: { modeleFacture: modele },
      disableClose: true,
      panelClass: 'preview-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'use') {
        this.router.navigate(['/facture', modele.id]);
      }
    });
  }

  createNewModele(): void {
    this.router.navigate(['/facture']);
  }

  get filteredModeles(): ModeleFacture[] {
    return this.modeles.filter(modele => 
      modele.nameModel.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}