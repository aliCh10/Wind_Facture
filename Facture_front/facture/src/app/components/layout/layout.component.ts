import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/AuthService';
@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  isSidebarActive: boolean = false;
  isMobile: boolean = false;

  partnerId: number | null = null;

  sidebarMenuItems = [
    { icon: 'home', label: 'MENU.HOME', route: '/home' },
    { icon: 'receipt_long', label: 'MENU.FACTURE', route: '/facture' },  
    { icon: 'people', label: 'MENU.Employé', route: '' },  
    { icon: 'description', label: 'MENU.SERVICES', route: '/services' }, // Changé ici
    { icon: 'person', label: 'MENU.client', route: '/clients' },  
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const storedPartnerId = localStorage.getItem('partnerId');
    if (storedPartnerId) {
      this.partnerId = +storedPartnerId; // Convertir en nombre
    }
  
    if (this.partnerId !== null) {
      this.sidebarMenuItems[2].route = `/employee/${this.partnerId}`; 
    }
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive; 
  }
}