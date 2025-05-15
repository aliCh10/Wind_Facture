import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { SystemService } from '../services/SystemService';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-system',
  standalone: false,
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
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

  constructor(
    private systemService: SystemService,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {
    translate.setDefaultLang('fr');
    translate.use('fr');
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr').subscribe(() => {
      console.log('Language set to French');
      console.log('PAGINATOR.RANGE:', this.translate.instant('PAGINATOR.RANGE', { start: 1, end: 5, total: 10 }));
      console.log('PAGINATOR.ITEMS_PER_PAGE:', this.translate.instant('PAGINATOR.ITEMS_PER_PAGE'));
      console.log('Partners List:', this.translate.instant('Partners List'));
    });
    this.getPartners();
    console.log(this.partners);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getPartners(): void {
    this.systemService.getPartners().subscribe(
      (data) => {
        this.partners = data;
        this.dataSource.data = data;
        this.isTableEmpty = this.partners.length === 0;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      (error) => {
        this.toastr.error(this.translate.instant('ERROR.FETCH_PARTNERS'), this.translate.instant('ERROR.TITLE'));
        console.error('Error fetching partners:', error);
      }
    );
  }

  isPartnerValidated(partner: any): boolean {
    return partner.validated;
  }

  validatePartner(id: number): void {
    const confirmMessage = this.translate.instant('CONFIRM.VALIDATE_TEXT');
    if (confirm(confirmMessage)) {
      this.systemService.validatePartner(id).subscribe(
        (response) => {
          this.toastr.success(
            this.translate.instant(response.message || 'SUCCESS.VALIDATE_PARTNER'),
            this.translate.instant('SUCCESS.TITLE')
          );
          const partnerIndex = this.partners.findIndex(p => p.id === id);
          if (partnerIndex !== -1) {
            this.partners[partnerIndex].validated = true;
            this.partners[partnerIndex].status = true;
            this.dataSource.data = [...this.partners];
          }
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
      this.toastr.info(
        this.translate.instant('INFO.VALIDATE_CANCELLED'),
        this.translate.instant('INFO.TITLE')
      );
    }
  }

  deletePartner(id: number): void {
    const confirmMessage = this.translate.instant('CONFIRM.DELETE_TEXT');
    if (confirm(confirmMessage)) {
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
      this.toastr.info(
        this.translate.instant('INFO.DELETE_CANCELLED'),
        this.translate.instant('INFO.TITLE')
      );
    }
  }

  onPageChange(event: any): void {
    this.dataSource.paginator!.pageIndex = event.pageIndex;
    this.dataSource.paginator!.pageSize = event.pageSize;
  }

  isNavCollapsed = false;

  onNavCollapse() {
    this.isNavCollapsed = !this.isNavCollapsed;
  }
}