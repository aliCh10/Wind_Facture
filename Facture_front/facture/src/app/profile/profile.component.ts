import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/AuthService';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userRole: string | null = null;
  partnerProfile: any = null;
  employeeProfile: any = null;
  logoFile: File | undefined;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.userRole = this.auth.getUserRole();
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    if (this.userRole === 'PARTNER') {
      this.getPartnerProfile();
    } else if (this.userRole === 'EMPLOYE') {
      this.getEmployeeProfile();
    }
  }

  getPartnerProfile(): void {
    this.auth.getPartnerProfile().subscribe({
      next: (data) => {
        this.partnerProfile = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || this.translate.instant('PROFILE.LOAD_PARTNER_FAILED'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }

  getEmployeeProfile(): void {
    this.auth.getEmployeeProfile().subscribe({
      next: (data) => {
        this.employeeProfile = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(
          this.translate.instant('PROFILE.LOAD_EMPLOYEE_FAILED'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }

  onLogoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille et le type du fichier
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        this.toastr.warning(this.translate.instant('PROFILE.LOGO_SIZE_ERROR'), this.translate.instant('DYNAMIC_MODAL.WARNING.TITLE'));
        return;
      }
      if (!file.type.match(/image\/*/)) {
        this.toastr.warning(this.translate.instant('PROFILE.LOGO_TYPE_ERROR'), this.translate.instant('DYNAMIC_MODAL.WARNING.TITLE'));
        return;
      }
      this.logoFile = file;
      
      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.partnerProfile.logoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updatePartnerProfile(): void {
    if (!this.partnerProfile) return;

    this.isLoading = true;

    const profileData = { ...this.partnerProfile };
    delete profileData.logoUrl;

    this.auth.updatePartnerProfile(this.partnerProfile.id, profileData, this.logoFile).subscribe({
      next: (response) => {
        this.toastr.success(
          response.message || this.translate.instant('PROFILE.UPDATE_PARTNER_SUCCESS'),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
        localStorage.setItem('name', this.partnerProfile.name || '');
        this.logoFile = undefined;
        this.isLoading = false;
        this.getPartnerProfile();
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || this.translate.instant('PROFILE.UPDATE_PARTNER_FAILED'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }

  updateEmployeeProfile(): void {
    if (!this.employeeProfile) return;

    this.isLoading = true;
    this.auth.updateEmployeeProfile(this.employeeProfile.id, this.employeeProfile).subscribe({
      next: (response) => {
        this.toastr.success(
          response.message || this.translate.instant('PROFILE.UPDATE_EMPLOYEE_SUCCESS'),
          this.translate.instant('DYNAMIC_MODAL.SUCCESS.TITLE')
        );
        localStorage.setItem('name', this.employeeProfile.name || '');
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(
          this.translate.instant('PROFILE.UPDATE_EMPLOYEE_FAILED'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        this.isLoading = false;
      }
    });
  }
}