import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/ClientService';
import { MatDialog } from '@angular/material/dialog';
import { UpdateClientModalComponent } from '../components/update-client-modal/update-client-modal.component';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-clients',
  standalone: false,
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  displayedColumns: string[] = ['clientName', 'clientPhone', 'clientAddress', 'rib', 'actions'];
  isLoading = false;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchClients();
  }

  fetchClients(): void {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe({
      next: (response) => {
        this.clients = response;
        this.dataSource.data = this.clients;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching clients', error);
        this.toastr.error('Impossible de charger les clients', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  // Méthode pour rafraîchir la liste des clients
  refreshClients(): void {
    this.fetchClients(); // Appeler la méthode fetchClients pour réactualiser la liste
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
      console.log('Résultat du modal :', result);
      if (result?.success) {
        this.toastr.success(result.message || 'Le client a été ajouté avec succès', 'Succès');
        this.refreshClients();
      } else if (result?.error) {
        this.toastr.error(result.message || 'Une erreur est survenue lors de l’ajout', 'Erreur');
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
        this.toastr.success(result.message || 'Client mis à jour avec succès', 'Succès');
        this.refreshClients();
      }
    });
  }

  deleteClient(clientId: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce client ? Cette action est irréversible.')) {
      this.clientService.deleteClient(clientId).subscribe({
        next: () => {
          this.clients = this.clients.filter(c => c.id !== clientId);
          this.dataSource.data = this.clients; // Update MatTableDataSource
          this.toastr.success('Client supprimé avec succès', 'Succès');
        },
        error: (error) => {
          console.error('Error deleting client', error);
          this.toastr.error('Échec de la suppression du client', 'Erreur');
        }
      });
    }
  }
}
