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

      private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

    createModeleFacture(request: CreateModeleFactureRequest): Observable<ModeleFacture> {

        return this.http.post<ModeleFacture>(this.apiUrl, request, { headers: this.getHeaders() }).pipe(
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

        return this.http.get<ModeleFacture>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
            catchError((error) => {
                console.error('Error fetching modele facture:', error);
                return throwError(() => new Error('Failed to fetch invoice template'));
            })
        );
    }
    // ModeleFactureService.ts
getAllModelesFacture(): Observable<ModeleFacture[]> {


  return this.http.get<ModeleFacture[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
          console.error('Error fetching all modeles facture:', error);
          return throwError(() => new Error('Failed to fetch invoice templates list'));
      })
  );
}
deleteModeleFacture(id: number): Observable<void> {


    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error deleting modele facture:', error);
        return throwError(() => new Error('Failed to delete invoice template'));
      })
    );
  }
  getModelePdf(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/pdf`, {
            headers: this.getHeaders().delete('Content-Type'), // Remove Content-Type for Blob
            responseType: 'blob'
        }).pipe(
            catchError((error) => {
                console.error('Error fetching modele PDF:', error);
                return throwError(() => new Error('Failed to fetch invoice template PDF'));
            })
        );
    }

    getModeleThumbnail(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/thumbnail`, {
            headers: this.getHeaders().delete('Content-Type'), // Remove Content-Type for Blob
            responseType: 'blob'
        }).pipe(
            catchError((error) => {
                console.error('Error fetching modele thumbnail:', error);
                return throwError(() => new Error('Failed to fetch invoice template thumbnail'));
            })
        );
    }


}