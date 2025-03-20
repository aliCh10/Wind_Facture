import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email: string = ''; // To store the email passed from the forgot password page
  verificationCode: string = '';
  newPassword: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Retrieve email from the query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      console.log('Email:', this.email);
    });
  }

  resetPassword() {
    console.log('Reset Password clicked');
    if (this.email && this.verificationCode && this.newPassword) {
      this.authService.resetPassword(this.email, this.verificationCode, this.newPassword).subscribe(
        (response) => {
          this.toastr.success('Votre mot de passe a été réinitialisé avec succès.', 'Succès');
          this.router.navigate(['/signin']); 
        },
        (error) => {
          this.toastr.error('Une erreur est survenue, veuillez réessayer.', 'Erreur');
        }
      );
    } else {
      this.toastr.warning('Veuillez remplir tous les champs.', 'Avertissement');
    }
  }
}
