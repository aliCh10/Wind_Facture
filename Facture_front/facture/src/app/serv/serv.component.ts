// src/app/serv/serv.component.ts
import { Component, OnInit } from '@angular/core';
import { Service } from '../models/service';
import { SerService } from '../services/ser.service';

@Component({
  selector: 'app-serv',
  standalone:false,
  templateUrl: './serv.component.html',
  styleUrls: ['./serv.component.css']
})
export class ServComponent implements OnInit {
  services: Service[] = [];
  displayedColumns: string[] = ['ref', 'serviceName', 'serviceQuantity', 'servicePrice', 'actions'];

  constructor(private serservice: SerService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.serservice.getAllServices().subscribe({
      next: (data) => this.services = data,
      error: (err) => console.error('Erreur lors du chargement des services', err)
    });
  }

  delete(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce service ?')) {
      this.serservice.deleteService(id).subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error('Erreur lors de la suppression', err)
      });
    }
  }
}
