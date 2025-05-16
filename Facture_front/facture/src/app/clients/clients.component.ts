import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/ClientService';
import { MatDialog } from '@angular/material/dialog';
import { UpdateClientModalComponent } from '../components/update-client-modal/update-client-modal.component';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

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
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
  
  }

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
        this.toastr.error(
          this.translate.instant('DYNAMIC_MODAL.CLIENT.ERROR.FETCH_FAILED'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }

  refreshClients(): void {
    this.fetchClients();
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('DYNAMIC_MODAL.CLIENT.form.addTitle'),
        type: 'client'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal result:', result);
      if (result?.success) {
        this.toastr.success(
          result.message || this.translate.instant('DYNAMIC_MODAL.CLIENT.SUCCESS.ADD'),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
        this.refreshClients();
      } else if (result?.error) {
        this.toastr.error(
          result.message || this.translate.instant('DYNAMIC_MODAL.ERROR.GENERIC'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
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
        this.toastr.success(
          result.message || this.translate.instant('DYNAMIC_MODAL.CLIENT.SUCCESS.UPDATE'),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
        this.refreshClients();
      }
    });
  }

  deleteClient(clientId: number): void {
    if (confirm(this.translate.instant('DYNAMIC_MODAL.CLIENT.CONFIRM.DELETE_CONFIRM'))) {
      this.clientService.deleteClient(clientId).subscribe({
        next: () => {
          this.clients = this.clients.filter(c => c.id !== clientId);
          this.dataSource.data = this.clients;
          this.toastr.success(
            this.translate.instant('DYNAMIC_MODAL.CLIENT.SUCCESS.DELETE'),
            this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
          );
        },
        error: (error) => {
          console.error('Error deleting client', error);
          this.toastr.error(
            this.translate.instant('DYNAMIC_MODAL.CLIENT.ERROR.DELETE_FAILED'),
            this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
          );
        }
      });
    }
  }
}