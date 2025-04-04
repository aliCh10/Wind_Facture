import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DynamicModalComponent } from '../dynamic-modal/dynamic-modal.component';

@Component({
  selector: 'app-toolbar',
  standalone: false,
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  @Input() partnerId: number | null = null; 
  @Output() refreshEmployees = new EventEmitter<void>(); // ✅ Correction de l'EventEmitter

  buttons = [
    { route: 'facture', label: 'Créer Facture', type: 'facture' },
    { route: 'employe', label: 'Créer Employé', type: 'employe' },
    { route: 'produit', label: 'Créer Produit', type: 'produit' },
    { route: 'client', label: 'Créer Client', type: 'client' }
  ];

  currentButtons: { route: string, label: string, type: string }[] = [];

  constructor(private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    this.updateButtons();
    this.router.events.subscribe(() => {
      this.updateButtons();
    });
  }

  updateButtons() {
    const url = this.router.url;
    this.currentButtons = this.buttons.filter(button => url.includes(`/${button.route}`));
  }

  openModal(button: { type: string, label: string }) {
    if (!this.partnerId) {
      console.error('Error: partnerId is undefined in ToolbarComponent');
      return;
    }

    const dialogRef = this.dialog.open(DynamicModalComponent, {
      width: '400px',
      data: {
        title: button.label,
        type: button.type,
        partnerId: this.partnerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log(`${result.type} ajouté avec succès`);
        this.refreshEmployees.emit(); // ✅ Émettre l'événement correctement
      }
    });
  }
}
