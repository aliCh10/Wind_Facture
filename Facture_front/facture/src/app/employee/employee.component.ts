import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UpdateEmployeeModalComponent } from '../components/update-employee-modal/update-employee-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { MatSort } from '@angular/material/sort';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-employee',
  standalone:false,
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit, AfterViewInit {
  employees: any[] = [];
  displayedColumns: string[] = ['name', 'secondName', 'email', 'tel', 'department', 'post', 'actions'];
  partnerId: number | null = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  isLoading: boolean = true;

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

    // Configure le filtrage personnalisé
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Ajoutez cette méthode pour gérer le changement de terme de recherche
  onSearchTermChange(searchTerm: string): void {
    this.dataSource.filter = searchTerm.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Crée un prédicat de filtrage personnalisé
// Modifiez la méthode createFilter pour ne filtrer que par nom
private createFilter(): (data: any, filter: string) => boolean {
  return (data, filter) => {
    const searchTerm = filter.toLowerCase();
    return data.name.toLowerCase().includes(searchTerm);
  };
}

  fetchEmployees(): void {
    this.isLoading = true;
    
    if (!this.partnerId) {
      this.toastr.error(
        this.translate.instant('employee.ERROR.NO_PARTNER_ID'),
        this.translate.instant('employee.ERROR.TITLE')
      );
      this.isLoading = false;
      return;
    }

    this.employeeService.getAllEmployees().subscribe({
      next: (response) => {
        this.employees = response;
        this.dataSource.data = this.employees;
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

  refreshEmployees(): void {
    this.dataSource.filter = '';
    this.fetchEmployees();
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
        this.fetchEmployees();
      }
    });
  }

 deleteEmployee(employeeId: number): void {
    // Use DialogService to open the confirmation dialog
    this.dialogService
      .openConfirmDialog({
        title: this.translate.instant('factures.CONFIRM.DELETE_TITLE'),
        message: this.translate.instant('employee.CONFIRM.DELETE_TEXT'),
        cancelText: this.translate.instant('factures.CONFIRM.CANCEL'),
        confirmText: this.translate.instant('factures.CONFIRM.OK'),
      })
      .subscribe((result) => {
        if (result) { // If user clicks "OK"
          this.employeeService.deleteEmployee(employeeId).subscribe({
            next: () => {
              this.toastr.success(
                this.translate.instant('employee.SUCCESS.DELETE'),
                this.translate.instant('employee.SUCCESS.TITLE')
              );
              this.fetchEmployees();
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