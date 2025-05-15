import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service, ServiceDTO } from '../../models/service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SerService } from '../../services/ser.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-service-modal',
  standalone: false,
  templateUrl: './update-service-modal.component.html',
  styleUrls: ['./update-service-modal.component.css']
})
export class UpdateServiceModalComponent implements OnInit {
  serviceForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<UpdateServiceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Service,
    private fb: FormBuilder,
    private serService: SerService,
    private toastr: ToastrService
  ) {
    this.serviceForm = this.fb.group({
      ref: ['', Validators.required],
      serviceName: ['', Validators.required],
      serviceQuantity: [0, [Validators.required, Validators.min(0)]],
      servicePrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.serviceForm.patchValue({
        ref: this.data.ref,
        serviceName: this.data.serviceName,
        serviceQuantity: this.data.serviceQuantity,
        servicePrice: this.data.servicePrice
      });
    } else {
      this.toastr.error('Données du service invalides ou ID manquant', 'Erreur');
      this.closeDialog();
    }
  }

  private hasChanges(): boolean {
    const formValues = this.serviceForm.value;
    return (
      formValues.ref !== this.data.ref ||
      formValues.serviceName !== this.data.serviceName ||
      formValues.serviceQuantity !== this.data.serviceQuantity ||
      formValues.servicePrice !== this.data.servicePrice
    );
  }

  onSave(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.toastr.error('Veuillez remplir tous les champs requis', 'Erreur');
      return;
    }

    if (!this.data.id) {
      this.toastr.error('ID du service manquant', 'Erreur');
      return;
    }

    if (!this.hasChanges()) {
      this.toastr.info('Aucun changement à enregistrer', 'Info');
      this.closeDialog();
      return;
    }

    this.isLoading = true;

    const serviceDTO: ServiceDTO = this.serviceForm.value;

    this.serService.updateService(this.data.id, serviceDTO).subscribe({
      next: () => {
        this.toastr.success('Service mis à jour avec succès', 'Succès');
        this.dialogRef.close({ success: true, message: 'Service mis à jour avec succès' });
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error(error.message || 'Échec de la mise à jour du service', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}