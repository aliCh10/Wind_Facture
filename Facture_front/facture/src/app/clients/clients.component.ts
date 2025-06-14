import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ClientService } from '../services/ClientService';
import { MatDialog } from '@angular/material/dialog';
import { UpdateClientModalComponent } from '../components/update-client-modal/update-client-modal.component';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-clients',
  standalone:false,
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, AfterViewInit {
  clients: any[] = [];
  displayedColumns: string[] = ['clientName', 'clientPhone', 'clientAddress', 'rib', 'actions'];
  isLoading = false;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  searchTerm$ = new Subject<string>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private translate: TranslateService,
     private dialogService: DialogService // Injecter DialogService
    
  ) {
    // Configure search with debounce
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchClients(term);
    });
  }

  ngOnInit(): void {
    this.fetchClients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

fetchClients(): void {
  this.isLoading = true;
  this.clientService.getAllClients().subscribe({
    next: (response) => {
      console.log('Fetched clients:', response);
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
searchClients(term: string): void {
  if (!term || term.trim() === '') {
    this.dataSource.data = this.clients;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    console.log('Search term empty, showing all clients:', this.clients.length);
    return;
  }

  this.isLoading = true;
  this.clientService.searchClients(term).subscribe({
    next: (response) => {
      console.log('Search results:', response, 'Length:', response.length);
      this.dataSource.data = response;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error searching clients:', error);
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.CLIENT.ERROR.FETCH_FAILED'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      this.isLoading = false;
    }
  });
}
onSearchChange(searchTerm: string): void {
  console.log('Received search term:', searchTerm);
  this.searchTerm$.next(searchTerm);
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
  this.dialogService.openConfirmDialog({
    title: this.translate.instant('factures.CONFIRM.DELETE_TITLE'),
    message: this.translate.instant('DYNAMIC_MODAL.CLIENT.CONFIRM.DELETE_CONFIRM'),
    cancelText: this.translate.instant('factures.CONFIRM.CANCEL'),
    confirmText: this.translate.instant('factures.CONFIRM.OK')
  }).subscribe({
    next: (result) => {
      if (result) { // Only proceed if the user confirmed (result is true)
        this.clients = this.clients.filter(c => c.id !== clientId);
        this.dataSource.data = this.clients;
        this.toastr.success(
          this.translate.instant('DYNAMIC_MODAL.CLIENT.SUCCESS.DELETE'),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
      }
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
