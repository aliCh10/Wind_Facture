import { Component, OnInit } from '@angular/core';
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
  verificationCode: string = ''; 
  userEmail: string | null = null; 

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userEmail = params['email'];
      console.log('Email récupéré:', this.userEmail);
    });
  }

  verifyCode(): void {
    if (this.userEmail && this.verificationCode) {
      console.log('Envoyer le code de vérification:', this.verificationCode);
      console.log('Email utilisé:', this.userEmail);
  
      this.authService.verifyCode(this.userEmail, this.verificationCode).subscribe({
        next: (response) => {
          console.log("Réponse de l'API de vérification:", response);
          
          if (response && response.token) {
            localStorage.setItem('authToken', response.token);
            console.log('Token enregistré dans localStorage:', response.token);

            this.toastr.success('Code correct! Redirection vers la connexion.', 'Succès');

            this.router.navigate(['/signin']);
          } else {
            console.error('Code de vérification invalide');
            this.toastr.error('Code incorrect, veuillez réessayer.', 'Erreur');
          }
        },
        error: (err) => {
          console.error("Erreur lors de la vérification:", err);
          this.toastr.error('Erreur de connexion au serveur.', 'Erreur');
        },
      });
    } else {
      console.log('Email ou code de vérification manquant');
      this.toastr.warning('Veuillez entrer un code de vérification.', 'Attention');
    }
  }
}
