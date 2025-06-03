import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-password-change-dialog',
  standalone:false,
  templateUrl: './password-change-dialog.component.html',
  styleUrls: ['./password-change-dialog.component.css']
})
export class PasswordChangeDialogComponent {
  newPassword: string = '';
  hidePassword: boolean = true;
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PasswordChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employeeId: number },
    private employeeService: EmployeeService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  onSubmit(): void {
    if (this.newPassword && this.newPassword.length >= 8) {
      this.isLoading = true;
      
      // Vérifiez que employeeId est bien défini
      if (!this.data.employeeId) {
        this.toastr.error(this.translate.instant('CHANGE_PASSWORD.INVALID_USER'));
        this.isLoading = false;
        return;
      }

      this.employeeService.changePassword(this.data.employeeId, this.newPassword).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('CHANGE_PASSWORD.SUCCESS'));
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur changement mot de passe:', err);
          let errorMsg = this.translate.instant('CHANGE_PASSWORD.ERROR');
          
          if (err.status === 403) {
            errorMsg = this.translate.instant('CHANGE_PASSWORD.FORBIDDEN');
          }
          
          this.toastr.error(errorMsg);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}