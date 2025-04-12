import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/User';
import { Client } from '../../models/Client';
import { Service } from '../../models/service';
import { SerService } from '../../services/ser.service';
import Swal from 'sweetalert2';
import { ClientService } from '../../services/ClientService';

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
  service: Service = new Service('', 0, '', 0);

  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<DynamicModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string; partnerId?: number },
    private employeeService: EmployeeService,
    private clientService: ClientService,
    private serService: SerService
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
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez remplir tous les champs du service'
      });
      return;
    }

    this.isLoading = true;

    this.serService.createService(this.service).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Service ajouté avec succès'
        });
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
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    if (!this.data.partnerId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'partnerId est manquant pour l\'employé !'
      });
      return;
    }

    this.isLoading = true;

    this.employeeService.addEmployee(this.data.partnerId, this.employee).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Employé ajouté avec succès'
        });
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
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.isLoading = true;

    this.clientService.addClient(this.client).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Client ajouté avec succès'
        });
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

    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: errorMessage
    });
  }
}
