import { Component } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}
sendForgotPasswordEmail() {
    if (this.email) {
      this.authService.forgotPassword(this.email).subscribe(
        (response) => {
          this.toastr.success('Un email avec le code de réinitialisation a été envoyé.', 'Succès');
          this.router.navigate(['/reset-password'], { queryParams: { email: this.email } }); // Assuming /reset-password is your reset password route
        },
        (error) => {
          this.toastr.error('Une erreur est survenue, veuillez réessayer.', 'Erreur');
        }
      );
    }
  }
}
