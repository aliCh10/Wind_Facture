import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ClientService } from '../services/ClientService';
import { MatDialog } from '@angular/material/dialog';
import { UpdateClientModalComponent } from '../components/update-client-modal/update-client-modal.component';
import Swal from 'sweetalert2';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import { MatTableDataSource } from '@angular/material/table';

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
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
  

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef 

  ) {}

  ngOnInit(): void {
    this.fetchClients();
  }

  fetchClients(): void {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe(
      (response) => {
        this.clients = response;
        this.dataSource.data = this.clients;
        this.isLoading = false;
        this.cdRef.detectChanges(); // Forcer la détection des changements
      },
      (error) => {
        console.error('Error fetching clients', error);
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger les clients', 'error');
      }
    );
  }
  
  // Méthode pour rafraîchir la liste des clients
  refreshClients(): void {
    this.fetchClients();  // Appeler la méthode fetchClients pour réactualiser la liste
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
      console.log('Résultat du modal :', result); // <-- à observer dans la console
      if (result?.success) {
        Swal.fire('Succès', 'Le client a été ajouté avec succès.', 'success');
        this.refreshClients();  // Rafraîchir la liste des clients après l'ajout
      } else if (result?.error) {
        Swal.fire('Erreur', 'Une erreur est survenue lors de l’ajout.', 'error');
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