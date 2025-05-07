import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DynamicModalComponent } from '../dynamic-modal/dynamic-modal.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-toolbar',
  standalone: false,
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  @Input() partnerId: number | null = null;
  @Output() refreshEmployees = new EventEmitter<void>();
  @Output() refreshClients = new EventEmitter<void>();
  @Output() refreshServices = new EventEmitter<void>();
  buttons = [
    { route: 'facture', label: 'TOOLBAR.CREATE_INVOICE', type: 'facture' },
    { route: 'employe', label: 'TOOLBAR.CREATE_EMPLOYEE', type: 'employe' },
    { route: 'clients', label: 'TOOLBAR.CREATE_CLIENT', type: 'client' },
    { route: 'services', label: 'TOOLBAR.CREATE_SERVICE', type: 'service' },
    { route: 'models', label: 'TOOLBAR.CREATE_TEMPLATE', type: 'modele' }
  ];
  
  currentButtons: { route: string, label: string, type: string }[] = [];

  constructor(
    private router: Router, 
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.updateButtons();
    this.router.events.subscribe(() => {
      this.updateButtons();
    });
  }

  updateButtons() {
    const url = this.router.url;
    if (url.includes('/partners')) {
      this.currentButtons = this.buttons; 
    } else {
      this.currentButtons = this.buttons.filter(button => url.includes(`/${button.route}`));
    }
  }

  openModal(button: { type: string, label: string }) {
    if (button.type === 'employe' && !this.partnerId) {
      console.error('Error: partnerId is undefined in ToolbarComponent for employee');
      return;
    }
    console.log('Opening modal for:', button);
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      width: '400px',
      data: {
        title: button.label,
        type: button.type,
        partnerId: button.type === 'employe' ? this.partnerId : undefined 
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log(`${button.type} ajouté avec succès`);
        this.refreshEmployees.emit(); 
  
        // Emission de l'événement pour les clients
        if (button.type === 'client') {
          this.refreshClients.emit();
        }
  
        // Emission de l'événement pour les services
        if (button.type === 'service') {
          this.refreshServices.emit();  // Ajout de cette ligne pour le service
        }
      }
    });
  }
  
  
}