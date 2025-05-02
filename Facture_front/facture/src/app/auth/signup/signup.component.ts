import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/AuthService';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';  // Importer ToastrService

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  hidePassword: boolean = true;
  passwordVisible = false;
  isLoading: boolean = false; // Add loading state



  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  
    
  )
  
  {
    this.signupForm = this.fb.group({
      personalInfo: this.fb.group({
        name: ['', Validators.required],
        secondName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        tel: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      }),
      companyInfo: this.fb.group({
        companyName: ['', Validators.required],
        address: ['', Validators.required],
        companytype: ['', Validators.required],
        logo: [null, Validators.required],
      }),
    });
  }

  get personalInfo(): FormGroup {
    return this.signupForm.get('personalInfo') as FormGroup;
  }

  get companyInfo(): FormGroup {
    return this.signupForm.get('companyInfo') as FormGroup;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true; // Show spinner
      const formData = new FormData();
      
      Object.keys(this.personalInfo.controls).forEach(key => {
        formData.append(key, this.personalInfo.get(key)?.value);
      });
      Object.keys(this.companyInfo.controls).forEach(key => {
        if (key === 'logo') {
          const logoFile = this.companyInfo.get('logo')?.value;
          if (logoFile) {
            formData.append('logo', logoFile);
          }
        } else {
          formData.append(key, this.companyInfo.get(key)?.value);
        }
      });

      this.authService.register(formData).subscribe(
        (response) => {
          this.toastr.success('Registration successful!', 'Success');
          setTimeout(() => {
            this.router.navigate(['/verify'], {
              queryParams: { email: this.personalInfo.get('email')?.value },
            });
          }, 2000);
        },
        (error) => {
          console.error('Registration failed', error);
          this.toastr.error('Something went wrong during registration. Please try again.', 'Error');
          this.isLoading = false; // Hide spinner on error
        },
        () => {
          this.isLoading = false; // Hide spinner when complete (success or error)
        }
      );
    } else {
      this.toastr.error('Please fill all required fields correctly.', 'Error');
    }
  }


  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; 
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Invalid file type. Please select a PNG, JPG, or WEBP image.';
        this.toastr.error(this.errorMessage, 'Error'); 
        return;
      }
      if (file.size > maxSize) {
        this.errorMessage = 'File is too large. Please upload a file smaller than 2MB.';
        this.toastr.error(this.errorMessage, 'Error');  
        return;
      }

      this.companyInfo.patchValue({ logo: file });
      this.companyInfo.get('logo')?.updateValueAndValidity();

      event.target.value = "";
    }
  }
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
