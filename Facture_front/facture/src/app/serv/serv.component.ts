import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Service } from '../models/service';
import { SerService } from '../services/ser.service';
import { ToastrService } from 'ngx-toastr';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import { UpdateServiceModalComponent } from '../components/update-service-modal/update-service-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-serv',
  standalone: false,
  templateUrl: './serv.component.html',
  styleUrls: ['./serv.component.css']
})
export class ServComponent implements OnInit {
  services: Service[] = [];
  displayedColumns: string[] = ['ref', 'serviceName', 'servicePrice', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  // Add pagination if needed
  // @ViewChild(MatPaginator) paginator!: MatPaginator;

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
      next: (data) => {
        this.services = data;
        this.dataSource.data = this.services;
        // Uncomment to enable pagination
        // if (this.paginator) {
        //   this.dataSource.paginator = this.paginator;
        // }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des services', err);
        this.toastr.error('Impossible de charger les services', 'Erreur');
      }
    });
  }

  refreshServices(): void {
    this.loadServices();
  }

  delete(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce service ?')) {
      this.serservice.deleteService(id).subscribe({
        next: () => {
          this.toastr.success('Service supprimé avec succès', 'Succès');
          this.loadServices();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          this.toastr.error('Une erreur est survenue lors de la suppression', 'Erreur');
        }
      });
    }
  }

  openAddServiceDialog(): void {
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      width: '500px',
      data: { type: 'service' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.toastr.success(result.message || 'Service ajouté', 'Succès');
        this.loadServices();
      }
    });
  }

  openUpdateServiceDialog(service: Service): void {
    if (!service.id) {
      console.error('Service ID is undefined:', service);
      this.toastr.error('Impossible d\'ouvrir la modification : ID du service manquant', 'Erreur');
      return;
    }
    const dialogRef = this.dialog.open(UpdateServiceModalComponent, {
      width: '500px',
      data: service
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.toastr.success(result.message || 'Service mis à jour', 'Succès');
        this.loadServices();
      }
    });
  }
}