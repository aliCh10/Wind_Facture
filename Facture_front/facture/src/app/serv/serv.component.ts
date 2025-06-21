import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Service, ServiceDTO, Page } from '../models/service';
import { SerService } from '../services/ser.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import { UpdateServiceModalComponent } from '../components/update-service-modal/update-service-modal.component';
import { DialogService } from '../services/dialog.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-serv',
  standalone: false,
  templateUrl: './serv.component.html',
  styleUrls: ['./serv.component.css']
})
export class ServComponent implements OnInit, AfterViewInit {
  services: Service[] = [];
  displayedColumns: string[] = ['ref', 'serviceName', 'servicePrice', 'actions'];
  dataSource = new MatTableDataSource<Service>([]);
  totalElements: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [5, 10, 20];
  currentSearchTerm: string = '';
  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private serservice: SerService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private translate: TranslateService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadServices(this.pageIndex, this.pageSize);
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.currentSearchTerm = searchTerm.trim();
      this.pageIndex = 0; // Reset to first page on search
      if (this.currentSearchTerm) {
        this.searchServices(this.currentSearchTerm, this.pageIndex, this.pageSize);
      } else {
        this.loadServices(this.pageIndex, this.pageSize);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onSearchInput(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  loadServices(page: number, size: number): void {
    this.serservice.getAllServices(page, size).subscribe({
      next: (pageData: Page<Service>) => {
        this.services = pageData.content;
        this.dataSource.data = this.services;
        this.totalElements = pageData.totalElements;
        this.pageSize = pageData.size;
        this.pageIndex = pageData.number;
      },
      error: (err) => {
        console.error('Error loading services', err);
        this.toastr.error(
          this.translate.instant('SERVICES_PAGE.ERROR.LOAD_FAILED') || 'Failed to load services',
          this.translate.instant('SERVICES_PAGE.ERROR.TITLE') || 'Error'
        );
      }
    });
  }

  searchServices(name: string, page: number, size: number): void {
    this.serservice.searchServicesByName(name, page, size).subscribe({
      next: (pageData: Page<Service>) => {
        this.services = pageData.content;
        this.dataSource.data = this.services;
        this.totalElements = pageData.totalElements;
        this.pageSize = pageData.size;
        this.pageIndex = pageData.number;
      },
      error: (err) => {
        console.error('Error searching services', err);
        this.toastr.error(
          this.translate.instant('SERVICES_PAGE.ERROR.SEARCH_FAILED') || 'Failed to search services',
          this.translate.instant('SERVICES_PAGE.ERROR.TITLE') || 'Error'
        );
      }
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.currentSearchTerm) {
      this.searchServices(this.currentSearchTerm, this.pageIndex, this.pageSize);
    } else {
      this.loadServices(this.pageIndex, this.pageSize);
    }
  }

  refreshServices(): void {
    this.currentSearchTerm = '';
    this.searchSubject.next('');
    this.pageIndex = 0;
    this.loadServices(this.pageIndex, this.pageSize);
  }

  openAdvancedSearch(): void {
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      width: '500px',
      data: { type: 'service-search' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success && result.serviceDTO) {
        this.serservice.searchServices(result.serviceDTO, this.pageIndex, this.pageSize).subscribe({
          next: (pageData: Page<Service>) => {
            this.services = pageData.content;
            this.dataSource.data = this.services;
            this.totalElements = pageData.totalElements;
            this.pageSize = pageData.size;
            this.pageIndex = pageData.number;
            this.toastr.success(
              this.translate.instant('SERVICES_PAGE.SUCCESS.SEARCH') || 'Search completed successfully',
              this.translate.instant('SERVICES_PAGE.SUCCESS.TITLE') || 'Success'
            );
          },
          error: (err) => {
            console.error('Error in advanced search', err);
            this.toastr.error(
              this.translate.instant('SERVICES_PAGE.ERROR.SEARCH_FAILED') || 'Failed to perform advanced search',
              this.translate.instant('SERVICES_PAGE.ERROR.TITLE') || 'Error'
            );
          }
        });
      }
    });
  }

  delete(id: number): void {
    this.dialogService
      .openConfirmDialog({
        title: this.translate.instant('factures.CONFIRM.DELETE_TITLE'),
        message: this.translate.instant('SERVICES_PAGE.CONFIRM.DELETE_TEXT') ,
         cancelText: this.translate.instant('factures.CONFIRM.CANCEL'),
        confirmText: this.translate.instant('factures.CONFIRM.OK'),
      })
      .subscribe((result) => {
        if (result) {
          this.serservice.deleteService(id).subscribe({
            next: () => {
              this.toastr.success(
                this.translate.instant('SERVICES_PAGE.SUCCESS.DELETE') || 'Service deleted successfully',
                this.translate.instant('SERVICES_PAGE.SUCCESS.TITLE') || 'Success'
              );
              this.loadServices(this.pageIndex, this.pageSize);
            },
            error: (err) => {
              console.error('Error deleting service', err);
              this.toastr.error(
                this.translate.instant('SERVICES_PAGE.ERROR.DELETE_FAILED') || 'Failed to delete service',
                this.translate.instant('SERVICES_PAGE.ERROR.TITLE') || 'Error'
              );
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
        this.toastr.success(
          result.message || this.translate.instant('SERVICES_PAGE.SUCCESS.ADD') || 'Service added successfully',
          this.translate.instant('SERVICES_PAGE.SUCCESS.TITLE') || 'Success'
        );
        this.loadServices(this.pageIndex, this.pageSize);
      }
    });
  }

  openUpdateServiceDialog(service: Service): void {
    if (!service.id) {
      console.error('Service ID is undefined:', service);
      this.toastr.error(
        this.translate.instant('SERVICES_PAGE.ERROR.UPDATE_OPEN_FAILED') || 'Cannot open update dialog: Service ID missing',
        this.translate.instant('SERVICES_PAGE.ERROR.TITLE') || 'Error'
      );
      return;
    }
    const dialogRef = this.dialog.open(UpdateServiceModalComponent, {
      width: '500px',
      data: service
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.toastr.success(
          result.message || this.translate.instant('SERVICES_PAGE.SUCCESS.UPDATE') || 'Service updated successfully',
          this.translate.instant('SERVICES_PAGE.SUCCESS.TITLE') || 'Success'
        );
        this.loadServices(this.pageIndex, this.pageSize);
      }
    });
  }
}