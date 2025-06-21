import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UpdateEmployeeModalComponent } from '../components/update-employee-modal/update-employee-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { MatSort } from '@angular/material/sort';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit, AfterViewInit {
  employees: any[] = [];
  displayedColumns: string[] = ['name', 'secondName', 'email', 'tel', 'department', 'post', 'actions'];
  partnerId: number | null = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  isLoading: boolean = true;
  totalElements: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private translate: TranslateService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('partnerId');
      this.partnerId = id ? +id : null;
      this.fetchEmployees();
    });

    // Remove client-side filter since we're using server-side search
    this.dataSource.filterPredicate = () => true; // Disable client-side filtering
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchEmployees(page: number = 0, size: number = this.pageSize): void {
    this.isLoading = true;

    if (!this.partnerId) {
      this.toastr.error(
        this.translate.instant('employee.ERROR.NO_PARTNER_ID'),
        this.translate.instant('employee.ERROR.TITLE')
      );
      this.isLoading = false;
      return;
    }

    const request = this.searchTerm
      ? this.employeeService.searchEmployees(this.searchTerm, page, size)
      : this.employeeService.getAllEmployees(page, size);

    request.subscribe({
      next: (response) => {
        this.employees = response.content;
        this.dataSource.data = this.employees;
        this.totalElements = response.totalElements;
        this.pageSize = response.size;
        this.pageIndex = response.page;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        this.toastr.error(
          this.translate.instant('employee.ERROR.LOAD_FAILED'),
          this.translate.instant('employee.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm.trim();
    this.pageIndex = 0; // Reset to first page on search
    this.fetchEmployees(this.pageIndex, this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchEmployees(this.pageIndex, this.pageSize);
  }

  refreshEmployees(): void {
    this.searchTerm = '';
    this.pageIndex = 0;
    this.fetchEmployees(this.pageIndex, this.pageSize);
  }

  openUpdateModal(employee: any): void {
    if (!employee.id) {
      this.toastr.error(
        this.translate.instant('employee.ERROR.MISSING_ID'),
        this.translate.instant('employee.ERROR.TITLE')
      );
      return;
    }

    const dialogRef = this.dialog.open(UpdateEmployeeModalComponent, {
      width: '450px',
      data: { employee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.fetchEmployees(this.pageIndex, this.pageSize);
      }
    });
  }

  deleteEmployee(employeeId: number): void {
    this.dialogService
      .openConfirmDialog({
        title: this.translate.instant('factures.CONFIRM.DELETE_TITLE'),
        message: this.translate.instant('employee.CONFIRM.DELETE_TEXT'),
        cancelText: this.translate.instant('factures.CONFIRM.CANCEL'),
        confirmText: this.translate.instant('factures.CONFIRM.OK'),
      })
      .subscribe((result) => {
        if (result) {
          this.employeeService.deleteEmployee(employeeId).subscribe({
            next: () => {
              this.toastr.success(
                this.translate.instant('employee.SUCCESS.DELETE'),
                this.translate.instant('employee.SUCCESS.TITLE')
              );
              this.fetchEmployees(this.pageIndex, this.pageSize);
            },
            error: (error) => {
              console.error('Error deleting employee:', error);
              this.toastr.error(
                this.translate.instant('employee.ERROR.DELETE_FAILED'),
                this.translate.instant('employee.ERROR.TITLE')
              );
            },
          });
        }
      });
  }
}