// ModeleFactureService.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateModeleFactureRequest } from '../models/create-modele-facture-request.model';
import { ModeleFacture } from '../models/modele-facture.model';

@Injectable({
    providedIn: 'root'
})
export class ModeleFactureService {
    private apiUrl = 'http://localhost:8094/api/modele-facture';

    constructor(private http: HttpClient) {}

    createModeleFacture(request: CreateModeleFactureRequest): Observable<ModeleFacture> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        console.log('Request URL:', this.apiUrl); // Log URL
        console.log('Request headers:', headers); // Log headers

        return this.http.post<ModeleFacture>(this.apiUrl, request, { headers }).pipe(
            catchError((error) => {
                console.error('Error creating modele facture:', error);
                console.log('Error status:', error.status); // HTTP status code
                console.log('Error message:', error.message); // Error message
                console.log('Error details:', error.error); // Server response (if any)
                return throwError(() => new Error('Failed to create invoice template'));
            })
        );
    }

    getModeleFacture(id: number): Observable<ModeleFacture> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.get<ModeleFacture>(`${this.apiUrl}/${id}`, { headers }).pipe(
            catchError((error) => {
                console.error('Error fetching modele facture:', error);
                return throwError(() => new Error('Failed to fetch invoice template'));
            })
        );
    }
    // ModeleFactureService.ts
getAllModelesFacture(): Observable<ModeleFacture[]> {
  const headers = new HttpHeaders({
      'Content-Type': 'application/json'
  });

  return this.http.get<ModeleFacture[]>(this.apiUrl, { headers }).pipe(
      catchError((error) => {
          console.error('Error fetching all modeles facture:', error);
          return throwError(() => new Error('Failed to fetch invoice templates list'));
      })
  );
}
deleteModeleFacture(id: number): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error deleting modele facture:', error);
        return throwError(() => new Error('Failed to delete invoice template'));
      })
    );
  }
  getModelePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob'
    });
}
}