import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UpdateEmployeeModalComponent } from '../components/update-employee-modal/update-employee-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  employees: any[] = [];
  displayedColumns: string[] = ['name', 'secondName', 'email', 'tel', 'department', 'post', 'actions'];
  partnerId: number | null = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    // Set default language to French
  
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('partnerId');
      this.partnerId = id ? +id : null;
      this.fetchEmployees();
    });
  }

  fetchEmployees(): void {
    if (!this.partnerId) {
      this.toastr.error(
        this.translate.instant('employee.ERROR.NO_PARTNER_ID'),
        this.translate.instant('employee.ERROR.TITLE')
      );
      return;
    }

    this.employeeService.getAllEmployees().subscribe({
      next: (response) => {
        this.employees = response;
        this.dataSource.data = this.employees;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('employee.ERROR.LOAD_FAILED'),
          this.translate.instant('employee.ERROR.TITLE')
        );
      }
    });
  }

  refreshEmployees(): void {
    this.fetchEmployees();
  }

  openUpdateModal(employee: any) {
    if (!employee.id) {
      this.toastr.error(
        this.translate.instant('employee.ERROR.MISSING_ID'),
        this.translate.instant('employee.ERROR.TITLE')
      );
      return;
    }
    const dialogRef = this.dialog.open(UpdateEmployeeModalComponent, {
      width: '400px',
      data: { employee }
    });
  }

  deleteEmployee(employeeId: number): void {
    if (confirm(this.translate.instant('employee.CONFIRM.DELETE_TEXT'))) {
      this.employeeService.deleteEmployee(employeeId).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('employee.SUCCESS.DELETE'),
            this.translate.instant('employee.SUCCESS.TITLE')
          );
          this.fetchEmployees();
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('employee.ERROR.DELETE_FAILED'),
            this.translate.instant('employee.ERROR.TITLE')
          );
        }
      });
    }
  }
}