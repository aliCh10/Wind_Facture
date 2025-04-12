import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service } from '../../models/service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { SerService } from '../../services/ser.service';
import Swal from 'sweetalert2'; // Import Swal

@Component({
  selector: 'app-update-service-modal',
  standalone: false,
  templateUrl: './update-service-modal.component.html',
  styleUrls: ['./update-service-modal.component.css']
})
export class UpdateServiceModalComponent {
  serviceForm: FormGroup;
  service: any;
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<UpdateServiceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Service,
    private fb: FormBuilder,
    private serviceService: SerService // Injecting the service
  ) {
    // Initialisation du formulaire
    this.service = data;
    this.serviceForm = this.fb.group({
      ref: [this.service.ref, Validators.required],
      serviceName: [this.service.serviceName, Validators.required],
      serviceQuantity: [this.service.serviceQuantity, [Validators.required, Validators.min(1)]],
      servicePrice: [this.service.servicePrice, [Validators.required, Validators.min(0.1)]],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.serviceForm.invalid) {
      return;  // Do not save if form is invalid
    }

    const updatedService: Service = {
      ...this.service,
      ...this.serviceForm.value
    };

    // Set loading state to true before calling the service method
    this.isLoading = true;

    // Call the updateService method
    this.serviceService.updateService(this.service.id, updatedService).subscribe(
      (response) => {
        // Show success message using Swal.fire
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Service mis à jour avec succès'
        }).then(() => {
          this.dialogRef.close({ success: true, updatedService: response, message: 'Service mis à jour avec succès' });
        });
        this.isLoading = false; // Set loading state to false after successful update
      },
      (error) => {
        // Handle error here and show error message using Swal.fire
        console.error('Error updating service:', error);
        this.isLoading = false; // Set loading state to false after error
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour du service'
        }).then(() => {
          this.dialogRef.close({ success: false, message: 'Erreur lors de la mise à jour du service' });
        });
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
