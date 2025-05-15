import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/User';
import { Client } from '../../models/Client';
import { Service } from '../../models/service';
import { SerService } from '../../services/ser.service';
import { ClientService } from '../../services/ClientService';
import { ToastrService } from 'ngx-toastr';

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
  service: Service = new Service(0, '', 0, '', 0);
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<DynamicModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string; partnerId?: number },
    private employeeService: EmployeeService,
    private clientService: ClientService,
    private serService: SerService,
    private toastr: ToastrService
  ) {
    console.log('Modal opened with type:', this.data.type, 'and partnerId:', this.data.partnerId);
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
      this.toastr.error('Veuillez remplir tous les champs du service', 'Erreur');
      return;
    }

    this.isLoading = true;

    this.serService.createService(this.service).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success('Service ajouté avec succès', 'Succès');
        this.dialogRef.close({
          success: true,
          service: response,
          message: 'Service ajouté avec succès'
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur:', error);
        this.handleError(error);
      }
    });
  }

  private saveEmployee(): void {
    if (!this.isEmployeeFormValid()) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires', 'Erreur');
      return;
    }

    if (!this.data.partnerId) {
      this.toastr.error('partnerId est manquant pour l\'employé', 'Erreur');
      return;
    }

    this.isLoading = true;

    this.employeeService.addEmployee(this.data.partnerId, this.employee).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success('Employé ajouté avec succès', 'Succès');
        this.dialogRef.close({
          success: true,
          employee: response,
          message: 'Employé ajouté avec succès'
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur:', error);
        this.handleError(error);
      }
    });
  }

  private saveClient(): void {
    if (!this.isClientFormValid()) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires', 'Erreur');
      return;
    }

    this.isLoading = true;

    this.clientService.addClient(this.client).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success('Client ajouté avec succès', 'Succès');
        this.dialogRef.close({
          success: true,
          client: response,
          message: 'Client ajouté avec succès'
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur:', error);
        this.handleError(error);
      }
    });
  }

  private isEmployeeFormValid(): boolean {
    return !!this.employee.name && !!this.employee.email && !!this.employee.tel;
  }

  private isClientFormValid(): boolean {
    return !!this.client.clientName && !!this.client.clientPhone;
  }

  private isServiceFormValid(): boolean {
    return !!this.service.ref && !!this.service.serviceName && this.service.serviceQuantity > 0 && this.service.servicePrice > 0;
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