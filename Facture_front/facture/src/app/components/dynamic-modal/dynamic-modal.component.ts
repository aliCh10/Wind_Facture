import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/User';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

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

  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<DynamicModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string; partnerId: number },
    private employeeService: EmployeeService,
    private toastr: ToastrService // Inject ToastrService
  ) {
    console.log('Modal opened with partnerId:', this.data.partnerId);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.isFormValid()) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires', 'Erreur');
      return;
    }

    if (!this.data.partnerId) {
      this.toastr.error('partnerId est manquant !', 'Erreur');
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

  private isFormValid(): boolean {
    return !!this.employee.name && !!this.employee.email && !!this.employee.tel;
  }

  private handleError(error: any): void {
    let errorMessage = 'Une erreur est survenue lors de l\'ajout de l\'employé';
    
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