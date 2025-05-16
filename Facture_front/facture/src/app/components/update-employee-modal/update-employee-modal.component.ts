import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

interface Employee {
  id: number;
  name: string;
  secondName: string;
  email: string;
  tel: string;
  department: string;
  post: string;
}

@Component({
  selector: 'app-update-employee-modal',
  standalone:false,
  templateUrl: './update-employee-modal.component.html',
  styleUrls: ['./update-employee-modal.component.css']
})
export class UpdateEmployeeModalComponent implements OnInit {
  employee: FormGroup;
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<UpdateEmployeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: Employee },
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.employee = this.fb.group({
      name: ['', Validators.required],
      secondName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', Validators.required],
      department: ['', Validators.required],
      post: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data?.employee?.id) {
      this.employee.patchValue({
        name: this.data.employee.name || '',
        secondName: this.data.employee.secondName || '',
        email: this.data.employee.email || '',
        tel: this.data.employee.tel || '',
        department: this.data.employee.department || '',
        post: this.data.employee.post || ''
      });
    } else {
      this.toastr.error(
        this.translate.instant('employee.ERROR.INVALID_DATA'),
        this.translate.instant('employee.ERROR.TITLE')
      );
      this.closeDialog();
    }
  }

  private hasChanges(): boolean {
    if (!this.data?.employee) return false;

    const formValues = this.employee.value;
    const original = this.data.employee;

    const normalize = (value: any): string => value ?? '';

    return (
      normalize(formValues.name) !== normalize(original.name) ||
      normalize(formValues.secondName) !== normalize(original.secondName) ||
      normalize(formValues.email) !== normalize(original.email) ||
      normalize(formValues.tel) !== normalize(original.tel) ||
      normalize(formValues.department) !== normalize(original.department) ||
      normalize(formValues.post) !== normalize(original.post)
    );
  }

  onSave(): void {
    if (this.employee.invalid) {
      this.employee.markAllAsTouched();
      this.toastr.error(
        this.translate.instant('employee.ERROR.FILL_REQUIRED_FIELDS'),
        this.translate.instant('employee.ERROR.TITLE')
      );
      return;
    }

    if (!this.data?.employee?.id) {
      this.toastr.error(
        this.translate.instant('employee.ERROR.MISSING_ID'),
        this.translate.instant('employee.ERROR.TITLE')
      );
      return;
    }

    if (!this.hasChanges()) {
      this.toastr.info(
        this.translate.instant('employee.INFO.NO_CHANGES'),
        this.translate.instant('employee.INFO.TITLE')
      );
      this.closeDialog();
      return;
    }

    this.isLoading = true;
    const employeeData = this.employee.value;

    this.employeeService.updateEmployee(this.data.employee.id, employeeData).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('employee.SUCCESS.UPDATE'),
          // this.translate.instant('employee.SUCCESS.TITLE')
        );
        this.dialogRef.close({ 
          success: true, 
          message: this.translate.instant('employee.SUCCESS.UPDATE') 
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error(
          error.message || this.translate.instant('employee.ERROR.UPDATE_FAILED'),
          this.translate.instant('employee.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}