import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify-code',
  standalone: false,
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.css'],
})
export class VerifyCodeComponent implements OnInit {
  verifyForm: FormGroup;
  userEmail: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.verifyForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userEmail = params['email'];
      console.log('Email récupéré:', this.userEmail);
      // if (!this.userEmail) {
      //   this.toastr.error('No email provided for verification.', 'Error');
      //   this.router.navigate(['/signup']);
      // }
    });
  }

  verifyCode(): void {
    if (this.verifyForm.valid && this.userEmail) {
      const code = this.verifyForm.get('verificationCode')?.value.trim(); // Trim whitespace
      console.log('Envoyer le code de vérification:', code);
      console.log('Email utilisé:', this.userEmail);

      this.authService.verifyCode(this.userEmail, code).subscribe({
        next: (response) => {
          console.log("Réponse de l'API de vérification:", response);
          this.toastr.success('Verification successful! Redirecting to sign-in.', 'Success');
          setTimeout(() => {
            this.router.navigate(['/signin']);
          }, 2000);
        },
        error: (err) => {
          console.error('Erreur lors de la vérification:', err);
          const errorMessage = err.error?.message || 'Invalid verification code. Please try again.';
          this.toastr.error(errorMessage, 'Error');
        }
      });
    } else {
      console.log('Formulaire invalide ou email manquant');
      this.toastr.warning('Please enter a valid verification code.', 'Warning');
    }
  }
}