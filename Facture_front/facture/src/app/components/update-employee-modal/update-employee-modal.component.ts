import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-update-employee-modal',
  standalone: false,
  templateUrl: './update-employee-modal.component.html',
  styleUrl: './update-employee-modal.component.css'
})
export class UpdateEmployeeModalComponent {
  employee: any;
  isLoading: boolean = false; // Add isLoading property

  constructor(
    public dialogRef: MatDialogRef<UpdateEmployeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private employeeService: EmployeeService,
    private toastr: ToastrService // Inject ToastrService
  ) {
    this.employee = { ...data.employee }; // Clone employee data
  }

  // Function to close the modal
  closeDialog() {
    this.dialogRef.close();
  }

  // Function to validate form fields
  private isFormValid(): boolean {
    return !!this.employee.name && !!this.employee.email && !!this.employee.tel;
  }

  // Function to submit employee update
  updateEmployee() {
    if (!this.isFormValid()) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires', 'Erreur');
      return;
    }

    this.isLoading = true; // Set loading state

    this.employeeService.updateEmployee(this.employee.id, this.employee).subscribe({
      next: (response) => {
        this.isLoading = false; // Reset loading state
        this.toastr.success('Employé modifié avec succès', 'Succès');
        this.dialogRef.close({ success: true, employee: response });
      },
      error: (error) => {
        this.isLoading = false; // Reset loading state
        this.toastr.error(
          error.error?.message || 'Erreur lors de la mise à jour de l\'employé',
          'Erreur'
        );
        console.error('Erreur lors de la mise à jour de l\'employé', error);
        this.dialogRef.close({ success: false });
      }
    });
  }
}