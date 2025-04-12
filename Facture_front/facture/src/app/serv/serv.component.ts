import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Service } from '../models/service';
import { SerService } from '../services/ser.service';
import { ToastrService } from 'ngx-toastr';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import Swal from 'sweetalert2';
import { UpdateServiceModalComponent } from '../components/update-service-modal/update-service-modal.component';

@Component({
  selector: 'app-serv',
  standalone: false,
  templateUrl: './serv.component.html',
  styleUrls: ['./serv.component.css']
})
export class ServComponent implements OnInit {
  services: Service[] = [];
  displayedColumns: string[] = ['ref', 'serviceName', 'serviceQuantity', 'servicePrice', 'actions'];

  constructor(
    private serservice: SerService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.serservice.getAllServices().subscribe({
      next: (data) => this.services = data,
      error: (err) => console.error('Erreur lors du chargement des services', err)
    });
  }
  refreshServices(): void {
    this.loadServices();
  }

  delete(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer ce service ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.serservice.deleteService(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Service supprimé avec succès'
            });
            this.loadServices();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur est survenue lors de la suppression'
            });
          }
        });
      }
    });
  }
  

  openAddServiceDialog(): void {
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      width: '500px',
      data: { type: 'service' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.toastr.success(result.message || 'Service ajouté');
        this.loadServices(); // Refresh automatique
      }
    });
  }

  openUpdateServiceDialog(service: Service): void {
    const dialogRef = this.dialog.open(UpdateServiceModalComponent, {
      width: '500px',
      data: service
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadServices(); // Refresh automatique
      }
    });
  }
}
