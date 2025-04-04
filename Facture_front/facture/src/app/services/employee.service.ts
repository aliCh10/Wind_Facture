import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private http: HttpClient) { }
   private apiUrl = 'http://localhost:8090/employee';
  
  
    private createHeaders(): HttpHeaders {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });
  
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
  
      return headers;
    }
  
    // Ajouter un employé
    addEmployee(partnerId: number, employee: any): Observable<any> {
      return this.http.post(
        `${this.apiUrl}/employee/${partnerId}`,
        employee,
        { headers: this.createHeaders() }
      );
    }
  
    // Récupérer un employé par son ID
    getEmployeeById(employeeId: number): Observable<any> {
      return this.http.get(
        `${this.apiUrl}/employee/${employeeId}`,
        { headers: this.createHeaders() }
      );
    }
  
    // Récupérer tous les employés
    getAllEmployees(): Observable<any> {
      return this.http.get(`${this.apiUrl}/employees`, { headers: this.createHeaders() });
    }
  
    // Mettre à jour un employé
    updateEmployee(employeeId: number, employee: any): Observable<any> {
      return this.http.put(
        `${this.apiUrl}/employee/${employeeId}`,
        employee,
        { headers: this.createHeaders() }
      );
    }
  
    // Supprimer un employé par ID
    deleteEmployee(employeeId: number): Observable<any> {
      return this.http.delete(
        `${this.apiUrl}/employee/${employeeId}`,
        { headers: this.createHeaders() }
      );
    }
  
    // Changer le mot de passe d'un employé
    changePassword(employeeId: number, newPassword: string): Observable<any> {
      return this.http.put(
        `${this.apiUrl}/employee/${employeeId}/change-password`,
        null, // on envoie null car le mot de passe est passé via le paramètre de requête
        {
          headers: this.createHeaders(),
          params: { newPassword },
        }
      );
    }
}
