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

  // Declare the sidebar menu items
  sidebarMenuItems = [
    { icon: 'home', label: 'MENU.HOME', route: '/home' },
    { icon: 'assignment', label: 'MENU.FACTURE', route: '/facture' },
    { icon: 'local_offer', label: 'MENU.Employé', route: '' },  // We'll update this dynamically
    { icon: 'dashboard', label: 'MENU.DASHBOARD', route: '/dashboard' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const storedPartnerId = localStorage.getItem('partnerId');
    if (storedPartnerId) {
      this.partnerId = +storedPartnerId; // Convert to number
    }
  
    if (this.partnerId !== null) {
      this.sidebarMenuItems[2].route = `/employee/${this.partnerId}`;  // Update the route with partnerId
    }
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive; 
  }
}
