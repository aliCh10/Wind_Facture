import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../services/ClientService';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-client-modal',
  standalone:false,
  templateUrl: './update-client-modal.component.html',
  styleUrls: ['./update-client-modal.component.css']
})
export class UpdateClientModalComponent {
  clientForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<UpdateClientModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client: any }
  ) {
    this.clientForm = this.fb.group({
      clientName: [data.client.clientName, Validators.required],
      clientPhone: [data.client.clientPhone, Validators.required],
      clientAddress: [data.client.clientAddress, Validators.required],
      rib: [data.client.rib, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.isLoading = true;
      const updatedClient = this.clientForm.value;

      this.clientService.updateClient(this.data.client.id, updatedClient).subscribe({
        next: () => {
          Swal.fire('Succès', 'Client mis à jour avec succès', 'success');
          this.dialogRef.close({ success: true });
        },
        error: (err) => {
          console.error('Update error:', err);
          Swal.fire('Erreur', 'Échec de la mise à jour du client', 'error');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}