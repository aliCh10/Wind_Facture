import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8090/public'; 

  constructor(private http: HttpClient) {}

  register(user: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  verifyCode(email: string, code: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.post(`${this.apiUrl}/verify?email=${email}&code=${code}`, null, { headers });
  }

  login(credentials: { email: string, password: string }) {
    return this.http.post<{ token: string; role: string; name?: string }>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        console.log('🔍 Réponse API:', response); // Vérifiez si name est présent
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        if (response.role) {
          localStorage.setItem('role', response.role);
          console.log('Role enregistré:', response.role);
        }
        if (response.name) {
          localStorage.setItem('name', response.name);
          console.log('Nom enregistré:', response.name);
        } else {
          console.warn('⚠️ Aucun name reçu du serveur.');
        }
      })
    );
  }
  
  
  getUserRole(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role');
    }
    return null;
  }
  
  
  

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password?email=${email}`, {});
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password?email=${email}&code=${code}&newPassword=${newPassword}`, {});
  }

  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      return !!token; 
    }
    return false; // Retourner false si exécuté côté serveur
  }
  
}
