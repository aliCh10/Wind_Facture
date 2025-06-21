import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UpdateClientModalComponent } from '../components/update-client-modal/update-client-modal.component';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DialogService } from '../services/dialog.service';
import { Client, Page } from '../models/Client';
import { ClientService } from '../services/ClientService';

@Component({
  selector: 'app-clients',
  standalone: false,
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['clientName', 'clientPhone', 'clientAddress', 'rib', 'actions'];
  dataSource = new MatTableDataSource<Client>([]);
  isLoading = false;
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;
  searchTerm$ = new Subject<string>();
  currentSearchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private translate: TranslateService,
    private dialogService: DialogService
  ) {
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.currentSearchTerm = term;
      this.pageIndex = 0; // Reset to first page on search
      this.fetchClients();
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
    const request = this.currentSearchTerm
      ? this.clientService.searchClients(this.currentSearchTerm, this.pageIndex, this.pageSize)
      : this.clientService.getAllClients(this.pageIndex, this.pageSize);

    request.subscribe({
      next: (page: Page<Client>) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error(
          error.message || this.translate.instant('DYNAMIC_MODAL.CLIENT.ERROR.FETCH_FAILED'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm$.next(searchTerm);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchClients();
  }

  refreshClients(): void {
    this.currentSearchTerm = ''; // Clear search term
    this.pageIndex = 0; // Reset to first page
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

  openUpdateModal(client: Client): void {
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
      } else if (result?.error) {
        this.toastr.error(
          result.message || this.translate.instant('DYNAMIC_MODAL.ERROR.GENERIC'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
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
        if (result) {
          this.clientService.deleteClient(clientId).subscribe({
            next: () => {
              this.toastr.success(
                this.translate.instant('DYNAMIC_MODAL.CLIENT.SUCCESS.DELETE'),
                this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
              );
              this.refreshClients();
            },
            error: (error) => {
              this.toastr.error(
                error.message || this.translate.instant('DYNAMIC_MODAL.CLIENT.ERROR.DELETE_FAILED'),
                this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
              );
            }
          });
        }
      }
    });
  }
}