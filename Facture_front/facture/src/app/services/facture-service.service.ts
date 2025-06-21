// src/app/services/facture-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CreateFactureRequest } from '../models/CreateFactureRequest';
import { Facture } from '../models/Facture';

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

  createInvoice(formData: CreateFactureRequest): Observable<Facture> {
    return this.http.post<Facture>(this.apiUrl, formData, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating invoice:', error);
        return throwError(() => new Error('Failed to create invoice'));
      })
    );
  }

  getFactures(page: number = 0, size: number = 10, sort: string = 'issueDate,desc'): Observable<{
    content: Facture[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
    pageSize: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders(), params }).pipe(
      map(response => ({
        content: response.content.map((facture: any) => ({
          ...facture,
          clientName: facture.clientName || 'N/A',
          clientPhone: facture.clientPhone || 'N/A', // Map clientPhone
          clientAddress: facture.clientAddress || 'N/A', // Map clientAddress
          clientRIB: facture.clientRIB || 'N/A', // Map clientRIB
          footerText: facture.footerText || 'N/A',
        })),
        currentPage: response.currentPage,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        pageSize: response.pageSize
      })),
      catchError((error) => {
        console.error('Error fetching factures:', error);
        return throwError(() => new Error('Failed to fetch factures'));
      })
    );
  }

  generatePdfPreview(id: number, clientData: Map<string, string>): Observable<Blob> {
    const data = Object.fromEntries(clientData);
    return this.http.post(`${this.apiUrl}/${id}/preview`, data, {
      headers: this.getHeaders(),
      responseType: 'blob',
    }).pipe(
      catchError((error) => {
        console.error('Error generating PDF preview:', error);
        return throwError(() => new Error('Failed to generate PDF preview'));
      })
    );
  }

  updateFactureModele(id: number, templateId: number): Observable<Facture> {
    const data = { templateId };
    return this.http.put<Facture>(`${this.apiUrl}/${id}/modele`, data, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating facture modele:', error);
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        console.log('Error details:', error.error);
        return throwError(() => new Error('Failed to update facture modele'));
      })
    );
  }

  deleteFacture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error deleting facture:', error);
        return throwError(() => new Error('Failed to delete facture'));
      })
    );
  }

  getRevenueByPeriod(periodType: string, startDate: string, endDate: string): Observable<Map<string, number>> {
    const params = { periodType, startDate, endDate };
    return this.http.get<Map<string, number>>(`${this.apiUrl}/stats/revenue-by-period`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError((error) => {
        console.error('Error fetching revenue by period:', error);
        return throwError(() => new Error('Failed to fetch revenue by period'));
      })
    );
  }

  getTopClientsByRevenue(limit: number = 5): Observable<Array<{ clientId: number; clientName: string; totalRevenue: number }>> {
    return this.http.get<Array<{ clientId: number; clientName: string; totalRevenue: number }>>(
      `${this.apiUrl}/stats/top-clients`,
      {
        headers: this.getHeaders(),
        params: { limit: limit.toString() }
      }
    ).pipe(
      map(response => response.map(client => ({
        clientId: client.clientId || 0,
        clientName: client.clientName || 'Unknown Client',
        totalRevenue: client.totalRevenue || 0
      }))),
      catchError((error) => {
        console.error('Error fetching top clients:', error);
        return throwError(() => new Error('Failed to fetch top clients'));
      })
    );
  }


  getTopServicesByRevenue(limit: number = 5): Observable<Array<{ serviceId: number; serviceName: string; totalRevenue: number }>> {
    return this.http.get<Array<{ serviceId: number; serviceName: string; totalRevenue: number }>>(`${this.apiUrl}/stats/top-services`, {
      headers: this.getHeaders(),
      params: { limit: limit.toString() }
    }).pipe(
      catchError((error) => {
        console.error('Error fetching top services:', error);
        return throwError(() => new Error('Failed to fetch top services'));
      })
    );
  }

  getTopModelesByUsage(limit: number = 5): Observable<Array<{ modeleId: number; modeleName: string; usageCount: number }>> {
    return this.http.get<Array<{ modeleId: number; modeleName: string; usageCount: number }>>(`${this.apiUrl}/stats/top-modeles`, {
      headers: this.getHeaders(),
      params: { limit: limit.toString() },
    }).pipe(
      catchError((error) => {
        console.error('Error fetching top modeles:', error);
        return throwError(() => new Error('Failed to fetch top modeles'));
      })
    );
  }
}