import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CreateFactureRequest } from '../models/CreateFactureRequest';

@Injectable({
  providedIn: 'root',
})
export class FactureServiceService {
  private apiUrl = 'http://localhost:8094/api/factures';

  constructor(private http: HttpClient) {}
      private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  createInvoice(formData: CreateFactureRequest): Observable<any> {


    return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });

  }
  generatePdfPreview(id: number, clientData: Map<string, string>): Observable<Blob> {
 
  const data = Object.fromEntries(clientData);
  console.log('Preview Request URL:', `${this.apiUrl}/${id}/preview`); // Debug
  console.log('Preview Request Data:', data); // Debug
  return this.http.post(`${this.apiUrl}/${id}/preview`, data, {
    headers: this.getHeaders(),
    responseType: 'blob',
  }).pipe(
    catchError((error) => {
      console.error('Error generating PDF preview:', error);
      console.log('Error status:', error.status); // HTTP status code
      console.log('Error message:', error.message); // Error message
      console.log('Error details:', error.error); // Server response
      return throwError(() => new Error('Failed to generate PDF preview'));
    })
  );
}
 

}