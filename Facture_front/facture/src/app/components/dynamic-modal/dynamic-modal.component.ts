import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SerService } from '../../services/ser.service';
import { ClientService } from '../../services/ClientService';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/User';
import { Client } from '../../models/Client';
import { Service, ServiceDTO } from '../../models/service';

@Component({
  selector: 'app-dynamic-modal',
  standalone: false,
  templateUrl: './dynamic-modal.component.html',
  styleUrls: ['./dynamic-modal.component.css']
})
export class DynamicModalComponent {
  employee: Employee = new Employee({
    name: '', email: '', tel: '', secondName: '', post: '', department: ''
  });
  client: Client = { clientName: '', clientPhone: '', clientAddress: '', rib: '' };
  service: Service = { id: null, ref: '', serviceName: '', servicePrice: '' };
  isLoading = false;
  serviceForm: FormGroup;
  clientForm: FormGroup;
  employeeForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DynamicModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string; partnerId?: number; serviceDTO?: ServiceDTO; employee?: Employee },
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private clientService: ClientService,
    private serService: SerService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    console.log('Modal opened with data:', this.data); // Debug: Log incoming data
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      secondName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      tel: ['', [Validators.required, Validators.pattern(/^\+?\d{8}$/)]],
      post: ['', [Validators.required, Validators.minLength(2)]],
      department: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.serviceForm = this.fb.group({
      ref: ['', [Validators.required, Validators.minLength(3)]],
      serviceName: ['', [Validators.required, Validators.minLength(3)]],
      servicePrice: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    this.clientForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(3)]],
      clientPhone: ['', [Validators.required, Validators.pattern(/^\+?\d{8,15}$/)]],
      clientAddress: ['', [Validators.required, Validators.minLength(5)]],
      rib: ['', [Validators.required, Validators.minLength(20)]]
    });

    // Initialize form for employee update
    if (this.data.type === 'employee' && this.data.employee) {
      console.log('Patching employee form with:', this.data.employee); // Debug: Log patched data
      this.employeeForm.patchValue(this.data.employee);
    } else if (this.data.type === 'service-search' && this.data.serviceDTO) {
      this.serviceForm.patchValue(this.data.serviceDTO);
    }
  }

  onClose(): void {
    console.log('Closing modal'); // Debug
    this.dialogRef.close();
  }

  onSave(): void {
    console.log('Save button clicked, type:', this.data.type, 'employeeForm valid:', this.employeeForm.valid); // Debug
    if (this.data.type === 'employe') {
      this.saveEmployee();
    } else if (this.data.type === 'client') {
      this.saveClient();
    } else if (this.data.type === 'service') {
      this.saveService();
    } else if (this.data.type === 'service-search') {
      this.searchService();
    }
  }

  private saveEmployee(): void {
    console.log('Saving employee, form value:', this.employeeForm.value, 'valid:', this.employeeForm.valid); // Debug
    if (!this.employeeForm.valid) {
      this.employeeForm.markAllAsTouched();
      console.log('Form invalid, errors:', this.employeeForm.errors); // Debug
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.ERROR.INVALID_FIELDS'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      return;
    }

    if (!this.data.partnerId && !this.data.employee) {
      console.log('Missing partnerId for adding employee'); // Debug
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.EMPLOYEE.ERROR.MISSING_PARTNER_ID'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      return;
    }

    const employeeData = this.employeeForm.value;
    this.isLoading = true;

    const request = this.data.employee
      ? this.employeeService.updateEmployee(this.data.employee.id, employeeData)
      : this.employeeService.addEmployee(this.data.partnerId!, employeeData);

    request.subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Employee saved successfully:', response); // Debug
        this.toastr.success(
          this.translate.instant(
            this.data.employee
              ? 'DYNAMIC_MODAL.EMPLOYEE.SUCCESS.UPDATE'
              : 'DYNAMIC_MODAL.EMPLOYEE.SUCCESS.ADD'
          ),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
        this.dialogRef.close({
          success: true,
          employee: response,
          message: this.translate.instant(
            this.data.employee
              ? 'DYNAMIC_MODAL.EMPLOYEE.SUCCESS.UPDATE'
              : 'DYNAMIC_MODAL.EMPLOYEE.SUCCESS.ADD'
          )
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error saving employee:', error); // Debug
        this.handleError(error);
      }
    });
  }

  private saveClient(): void {
    if (!this.clientForm.valid) {
      this.clientForm.markAllAsTouched();
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.ERROR.INVALID_FIELDS'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      return;
    }

    const client: Client = this.clientForm.value;
    this.isLoading = true;
    this.clientService.addClient(client).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success(
          this.translate.instant('DYNAMIC_MODAL.CLIENT.SUCCESS.ADD'),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
        this.dialogRef.close({
          success: true,
          client: response,
          message: this.translate.instant('DYNAMIC_MODAL.CLIENT.SUCCESS.ADD')
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error);
      }
    });
  }

  private saveService(): void {
    if (!this.serviceForm.valid) {
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.SERVICE.ERROR.INVALID'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      return;
    }

    const serviceDTO: ServiceDTO = {
      ref: this.serviceForm.get('ref')?.value,
      serviceName: this.serviceForm.get('serviceName')?.value,
      servicePrice: this.serviceForm.get('servicePrice')?.value
    };

    this.isLoading = true;
    this.serService.createService(serviceDTO).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success(
          this.translate.instant('DYNAMIC_MODAL.SERVICE.SUCCESS.ADD'),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
        this.dialogRef.close({
          success: true,
          service: response,
          message: this.translate.instant('DYNAMIC_MODAL.SERVICE.SUCCESS.ADD')
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error);
      }
    });
  }

  private searchService(): void {
    if (!this.serviceForm.valid) {
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.SERVICE.ERROR.INVALID'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      return;
    }

    const serviceDTO: ServiceDTO = {
      ref: this.serviceForm.get('ref')?.value || '',
      serviceName: this.serviceForm.get('serviceName')?.value || '',
      servicePrice: this.serviceForm.get('servicePrice')?.value || ''
    };

    this.dialogRef.close({ serviceDTO });
  }

  private handleError(error: any): void {
    let errorMessage = this.translate.instant('DYNAMIC_MODAL.ERROR.GENERIC');
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = this.translate.instant('DYNAMIC_MODAL.ERROR.NO_CONNECTION');
    } else if (error.status === 400) {
      errorMessage = this.translate.instant('DYNAMIC_MODAL.ERROR.INVALID_DATA');
    } else if (error.status === 409) {
      errorMessage = error.error?.message || this.translate.instant('DYNAMIC_MODAL.ERROR.CONFLICT');
    }
    console.error('Error details:', error); // Debug
    this.toastr.error(errorMessage, this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE'));
  }
}