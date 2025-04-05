import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/ClientService';
import { MatDialog } from '@angular/material/dialog';
import { UpdateClientModalComponent } from '../components/update-client-modal/update-client-modal.component';
import Swal from 'sweetalert2';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';

@Component({
  selector: 'app-clients',
  standalone:false,
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  displayedColumns: string[] = ['clientName', 'clientPhone', 'clientAddress', 'rib', 'actions'];
  isLoading = false;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchClients();
  }

  fetchClients(): void {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe(
      (response) => {
        this.clients = response;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching clients', error);
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger les clients', 'error');
      }
    );
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      width: '400px',
      data: {
        title: 'Créer Client',
        type: 'client'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.fetchClients();
      }
    });
  }

  openUpdateModal(client: any): void {
    const dialogRef = this.dialog.open(UpdateClientModalComponent, {
      width: '500px',
      data: { client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.fetchClients();
      }
    });
  }

  deleteClient(clientId: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientService.deleteClient(clientId).subscribe(
          () => {
            this.clients = this.clients.filter(c => c.id !== clientId);
            Swal.fire('Supprimé !', 'Le client a été supprimé.', 'success');
          },
          (error) => {
            Swal.fire('Erreur !', 'Échec de la suppression du client.', 'error');
          }
        );
      }
    });
  }
}