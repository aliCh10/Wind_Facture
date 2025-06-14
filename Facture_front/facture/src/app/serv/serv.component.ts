import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Service } from '../models/service';
import { SerService } from '../services/ser.service';
import { ToastrService } from 'ngx-toastr';
import { DynamicModalComponent } from '../components/dynamic-modal/dynamic-modal.component';
import { UpdateServiceModalComponent } from '../components/update-service-modal/update-service-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DialogService } from '../services/dialog.service';

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
    private searchSubject = new Subject<string>();

 

  constructor(
    private serservice: SerService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private translate: TranslateService,
     private dialogService: DialogService // Injecter DialogService

  ) {
   
  }

  ngOnInit(): void {
    this.loadServices();
     this.searchSubject.pipe(
      debounceTime(300), 
      distinctUntilChanged() 
    ).subscribe(searchTerm => {
      if (searchTerm) {
        this.searchServices(searchTerm);
      } else {
        this.loadServices();
      }
    });
  }
  onSearchInput(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  searchServices(name: string): void {
    this.serservice.searchServicesByName(name).subscribe({
      next: (data) => {
        this.services = data;
        this.dataSource.data = this.services;
      },
      error: (err) => {
        console.error('Error searching services', err);
        this.toastr.error(
          this.translate.instant('SERVICES_PAGE.ERROR.SEARCH_FAILED'),
          this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
        );
      }
    });
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
        console.error('Error loading services', err);
        this.toastr.error(
          this.translate.instant('SERVICES_PAGE.ERROR.LOAD_FAILED'),
          this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
        );
      }
    });
  }

  refreshServices(): void {
    this.loadServices();
  }

 delete(id: number): void {
  this.dialogService
    .openConfirmDialog({
      title: this.translate.instant('factures.CONFIRM.DELETE_TITLE'),
      message: this.translate.instant('SERVICES_PAGE.CONFIRM.DELETE_TEXT'),
      cancelText: this.translate.instant('factures.CONFIRM.CANCEL'),
      confirmText: this.translate.instant('factures.CONFIRM.OK')
    })
    .subscribe((result) => {
      if (result) {
        this.serservice.deleteService(id).subscribe({
          next: () => {
            this.toastr.success(
              this.translate.instant('SERVICES_PAGE.SUCCESS.DELETE'),
              this.translate.instant('SERVICES_PAGE.SUCCESS.TITLE')
            );
            this.loadServices();
          },
          error: (err) => {
            console.error('Error deleting service', err);
            this.toastr.error(
              this.translate.instant('SERVICES_PAGE.ERROR.DELETE_FAILED'),
              this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
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
          result.message || this.translate.instant('SERVICES_PAGE.SUCCESS.ADD'),
          this.translate.instant('SERVICES_PAGE.SUCCESS.TITLE')
        );
        this.loadServices();
      }
    });
  }

  openUpdateServiceDialog(service: Service): void {
    if (!service.id) {
      console.error('Service ID is undefined:', service);
      this.toastr.error(
        this.translate.instant('SERVICES_PAGE.ERROR.UPDATE_OPEN_FAILED'),
        this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
      );
      return;
    }
    const dialogRef = this.dialog.open(UpdateServiceModalComponent, {
      width: '500px',
      data: service
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // this.toastr.success(
        //   result.message || this.translate.instant('SERVICES_PAGE.SUCCESS.UPDATE'),
        //   this.translate.instant('SERVICES_PAGE.SUCCESS.TITLE')
        // );
        this.loadServices();
      }
    });
  }
}