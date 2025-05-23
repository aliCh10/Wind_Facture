import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/User';
import { Client } from '../../models/Client';
import { Service, ServiceDTO } from '../../models/service';
import { SerService } from '../../services/ser.service';
import { ClientService } from '../../services/ClientService';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dynamic-modal',
  standalone: false,
  templateUrl: './dynamic-modal.component.html',
  styleUrls: ['./dynamic-modal.component.css']
})
export class DynamicModalComponent {
  employee: Employee = new Employee({
    name: '',
    email: '',
    tel: '',
    secondName: '',
    post: '',
    department: ''
  });

  client: Client = new Client('', '', '', '');
  service: Service = new Service(0, '',  '', 0);
  isLoading = false;
    serviceForm: FormGroup;
    clientForm: FormGroup;


  constructor(
    public dialogRef: MatDialogRef<DynamicModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string; partnerId?: number },
        private fb: FormBuilder,

    private employeeService: EmployeeService,
    private clientService: ClientService,
    private serService: SerService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
     this.serviceForm = this.fb.group({
      ref: ['', Validators.required],
      serviceName: ['', Validators.required],
      servicePrice: [0, [Validators.required, Validators.min(0)]]
    });
    this.clientForm = this.fb.group({
      clientName: ['', Validators.required],
      clientPhone: ['', [Validators.required, Validators.pattern(/^\+?\d{8,15}$/)]],
      clientAddress: ['', Validators.required],
      clientRIB: ['', Validators.required]
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.type === 'employe') {
      this.saveEmployee();
    } else if (this.data.type === 'client') {
      this.saveClient();
    } else if (this.data.type === 'service') {
      this.saveService();
    }
  }

private saveService(): void {
  if (!this.isServiceFormValid()) {
    this.toastr.error(
      this.translate.instant('DYNAMIC_MODAL.SERVICE.ERROR.INVALID'),
      this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
    );
    return;
  }

  // Create a clean DTO without id for new service
  const serviceDTO: ServiceDTO = {
    ref: this.service.ref,
    serviceName: this.service.serviceName,
    servicePrice: this.service.servicePrice.toString()
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
      console.error('Error details:', error);
      this.handleError(error);
    }
  });
}

  private saveEmployee(): void {
    if (!this.isEmployeeFormValid()) {
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.ERROR.INVALID_FIELDS'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      return;
    }

    if (!this.data.partnerId) {
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.EMPLOYEE.ERROR.MISSING_PARTNER_ID'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      return;
    }

    this.isLoading = true;

    this.employeeService.addEmployee(this.data.partnerId, this.employee).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success(
          this.translate.instant('DYNAMIC_MODAL.EMPLOYEE.SUCCESS.ADD'),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
        this.dialogRef.close({
          success: true,
          employee: response,
          message: this.translate.instant('DYNAMIC_MODAL.EMPLOYEE.SUCCESS.ADD')
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error:', error);
        this.handleError(error);
      }
    });
  }

 private saveClient(): void {
    if (!this.isClientFormValid()) {
      this.toastr.error(
        this.translate.instant('DYNAMIC_MODAL.ERROR.INVALID_FIELDS'),
        this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
      );
      return;
    }
    this.client = new Client(
      this.clientForm.get('clientName')?.value,
      this.clientForm.get('clientPhone')?.value,
      this.clientForm.get('clientAddress')?.value,
      this.clientForm.get('clientRIB')?.value
    );

    this.isLoading = true;

    this.clientService.addClient(this.client).subscribe({
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
        console.error('Error:', error);
        this.handleError(error);
      }
    });
  }

  private isEmployeeFormValid(): boolean {
    return !!this.employee.name && !!this.employee.email && !!this.employee.tel;
  }
private isClientFormValid(): boolean {
    return this.clientForm.valid;
  }

  private isServiceFormValid(): boolean {
  return !!this.service.ref && !!this.service.serviceName && Number(this.service.servicePrice) > 0;
  }

  private handleError(error: any): void {
    let errorMessage = 'Une erreur est survenue lors de l\'ajout';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    } else if (error.status === 400) {
      errorMessage = 'Données invalides. Vérifiez les informations saisies.';
    }

    this.toastr.error(errorMessage, 'Erreur');
  }
}