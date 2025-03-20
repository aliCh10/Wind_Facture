import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  private apiUrl = 'http://localhost:8090/public'; 

  constructor(private http: HttpClient) {}
  private createHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
  
    return headers;
  }
  


  // Récupérer la liste des partenaires
  getPartners(): Observable<any> {
    return this.http.get(`${this.apiUrl}/system/partners`, { headers: this.createHeaders() });
  }

  // Valider un partenaire par ID
  validatePartner(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/system/validate-partner/${id}`, {}, { headers: this.createHeaders() });
  }

  // Supprimer un partenaire par ID
  deletePartner(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/system/delete-partner/${id}`, { headers: this.createHeaders() });
  }
}
