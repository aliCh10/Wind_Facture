import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { SystemService } from '../services/SystemService';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-system',
  standalone: false,
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css'],
})
export class SystemComponent implements OnInit, AfterViewInit {
  sidebarMenuItems = [
    { icon: 'person', label: 'MENU.Partners', route: '/system' },
    { icon: 'settings', label: 'MENU.SETTINGS', route: '/settings' },
  ];

  partners: any[] = [];
  currentPartner: any = {};
  isTableEmpty: boolean = false;
  displayedColumns: string[] = ['name', 'email', 'companyName', 'status', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 5;
  pageIndex = 0;
  totalElements = 0;
  sort = 'name,asc';
  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor(
    private systemService: SystemService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr').subscribe(() => {
      console.log('Language set to French');
    });

    // Debounce search input to avoid excessive API calls
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchTerm) => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0; // Reset to first page on search
      this.getPartners();
    });

    this.getPartners();
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe((event) => {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
      this.getPartners();
    });
  }

  getPartners(): void {
    this.systemService.getPartners(this.pageIndex, this.pageSize, this.sort, this.searchTerm || undefined).subscribe(
      (data) => {
        this.partners = data.content;
        this.dataSource.data = this.partners;
        this.isTableEmpty = this.partners.length === 0;
        this.totalElements = data.totalElements;
        this.paginator.length = this.totalElements;
        this.paginator.pageIndex = this.pageIndex;
        this.paginator.pageSize = this.pageSize;
      },
      (error) => {
        this.toastr.error(this.translate.instant('ERROR.FETCH_PARTNERS'), this.translate.instant('ERROR.TITLE'));
        console.error('Error fetching partners:', error);
      }
    );
  }

  onSearch(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  isPartnerValidated(partner: any): boolean {
    return partner.validated;
  }

  validatePartner(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('CONFIRM.VALIDATE_TITLE'),
        message: this.translate.instant('CONFIRM.VALIDATE_TEXT'),
        confirmText: this.translate.instant('CONFIRM.VALIDATE_CONFIRM'),
        cancelText: this.translate.instant('CONFIRM.VALIDATE_CANCEL'),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.systemService.validatePartner(id).subscribe(
          (response) => {
            this.toastr.success(
              this.translate.instant(response.message || 'SUCCESS.VALIDATE_PARTNER'),
              this.translate.instant('SUCCESS.TITLE')
            );
            this.getPartners(); // Refresh the list
          },
          (error) => {
            this.toastr.error(
              this.translate.instant(error.error?.message || 'ERROR.VALIDATE_FAILED'),
              this.translate.instant('ERROR.TITLE')
            );
            console.error('Error validating partner:', error);
          }
        );
      } else {
        this.toastr.info(this.translate.instant('INFO.VALIDATE_CANCELLED'), this.translate.instant('INFO.TITLE'));
      }
    });
  }

  deletePartner(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('factures.CONFIRM.DELETE_TITLE'),
        message: this.translate.instant('CONFIRM.DELETE_TEXT'),
        cancelText: this.translate.instant('factures.CONFIRM.CANCEL'),
        confirmText: this.translate.instant('factures.CONFIRM.OK'),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.systemService.deletePartner(id).subscribe(
          (response) => {
            this.toastr.success(
              this.translate.instant(response.message || 'SUCCESS.DELETE_PARTNER'),
              this.translate.instant('SUCCESS.TITLE')
            );
            this.getPartners();
          },
          (error) => {
            this.toastr.error(
              this.translate.instant(error.error?.message || 'ERROR.DELETE_FAILED'),
              this.translate.instant('ERROR.TITLE')
            );
            console.error('Error deleting partner:', error);
          }
        );
      } else {
        this.toastr.info(this.translate.instant('INFO.DELETE_CANCELLED'), this.translate.instant('INFO.TITLE'));
      }
    });
  }

  isNavCollapsed = false;

  onNavCollapse() {
    this.isNavCollapsed = !this.isNavCollapsed;
  }
}