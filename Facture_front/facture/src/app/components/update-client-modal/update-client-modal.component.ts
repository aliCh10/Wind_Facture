import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '../../services/ClientService';
import { ToastrService } from 'ngx-toastr';

// Define interface for client data to ensure type safety
interface Client {
  id: number;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  rib: string;
}

@Component({
  selector: 'app-update-client-modal',
  standalone: false,
  templateUrl: './update-client-modal.component.html',
  styleUrls: ['./update-client-modal.component.css']
})
export class UpdateClientModalComponent implements OnInit {
  clientForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<UpdateClientModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client: Client }
  ) {
    this.clientForm = this.fb.group({
      clientName: ['', Validators.required],
      clientPhone: ['', Validators.required],
      clientAddress: ['', Validators.required],
      rib: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data?.client?.id) {
      this.clientForm.patchValue({
        clientName: this.data.client.clientName || '',
        clientPhone: this.data.client.clientPhone || '',
        clientAddress: this.data.client.clientAddress || '',
        rib: this.data.client.rib || ''
      });
    } else {
      this.toastr.error('Données du client invalides ou ID manquant', 'Erreur');
      this.dialogRef.close();
    }
  }

  /**
   * Checks if the form values differ from the original client data.
   * Returns true if any field has changed, false otherwise.
   */
  private hasChanges(): boolean {
    if (!this.data?.client) {
      return false; // No client data to compare against
    }

    const formValues = this.clientForm.value;
    const original = this.data.client;

    // Normalize values to handle null/undefined and ensure consistent comparison
    const normalize = (value: any): string => value ?? '';

    return (
      normalize(formValues.clientName) !== normalize(original.clientName) ||
      normalize(formValues.clientPhone) !== normalize(original.clientPhone) ||
      normalize(formValues.clientAddress) !== normalize(original.clientAddress) ||
      normalize(formValues.rib) !== normalize(original.rib)
    );
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.toastr.error('Veuillez remplir tous les champs requis', 'Erreur');
      return;
    }

    if (!this.data?.client?.id) {
      this.toastr.error('ID du client manquant', 'Erreur');
      return;
    }

    if (!this.hasChanges()) {
      this.toastr.info('Aucun changement à enregistrer', 'Info');
      this.dialogRef.close();
      return;
    }

    this.isLoading = true;
    const updatedClient = this.clientForm.value;

    this.clientService.updateClient(this.data.client.id, updatedClient).subscribe({
      next: () => {
        this.dialogRef.close({ success: true, message: 'Client mis à jour avec succès' });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Update error:', err);
        this.toastr.error(err.message || 'Échec de la mise à jour du client', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}