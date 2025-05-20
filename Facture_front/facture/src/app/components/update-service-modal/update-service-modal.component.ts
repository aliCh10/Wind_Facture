import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service, ServiceDTO } from '../../models/service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SerService } from '../../services/ser.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

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
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.serviceForm = this.fb.group({
      ref: ['', Validators.required],
      serviceName: ['', Validators.required],
      servicePrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.serviceForm.patchValue({
        ref: this.data.ref,
        serviceName: this.data.serviceName,
        servicePrice: this.data.servicePrice
      });
    } else {
      this.toastr.error(
        this.translate.instant('SERVICES_PAGE.ERROR.INVALID_DATA'),
        this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
      );
      this.closeDialog();
    }
  }

  private hasChanges(): boolean {
    const formValues = this.serviceForm.value;
    return (
      formValues.ref !== this.data.ref ||
      formValues.serviceName !== this.data.serviceName ||
      formValues.servicePrice !== this.data.servicePrice
    );
  }

  onSave(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.toastr.error(
        this.translate.instant('SERVICES_PAGE.ERROR.INVALID_FIELDS'),
        this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
      );
      return;
    }

    if (!this.data.id) {
      this.toastr.error(
        this.translate.instant('SERVICES_PAGE.ERROR.MISSING_ID'),
        this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
      );
      return;
    }

    if (!this.hasChanges()) {
      this.toastr.info(
        this.translate.instant('SERVICES_PAGE.INFO.NO_CHANGES'),
        this.translate.instant('SERVICES_PAGE.INFO.TITLE')
      );
      this.closeDialog();
      return;
    }

    this.isLoading = true;

    const serviceDTO: ServiceDTO = this.serviceForm.value;

    this.serService.updateService(this.data.id, serviceDTO).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('SERVICES_PAGE.SUCCESS.UPDATE'),
          // this.translate.instant('SERVICES_PAGE.SUCCESS.TITLE')
        );
        this.dialogRef.close({ 
          success: true, 
          // message: this.translate.instant('SERVICES_PAGE.SUCCESS.CUSTOM_UPDATE') 
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error(
          error.message || this.translate.instant('SERVICES_PAGE.ERROR.UPDATE_FAILED'),
          this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}