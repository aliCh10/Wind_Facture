import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/User';
import { Client } from '../../models/Client';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../services/ClientService';
import { Service } from '../../models/service';

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
    }
  }

  private saveEmployee(): void {
    if (!this.isEmployeeFormValid()) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires', 'Erreur');
      return;
    }

    if (!this.data.partnerId) {
      this.toastr.error('partnerId est manquant pour l\'employé !', 'Erreur');
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

    // Assuming ClientService.addClient doesn’t need partnerId
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