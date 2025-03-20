import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  sidebarMenuItems = [
    { icon: 'home', label: 'MENU.HOME', route: '/home' },
    { icon: 'assignment', label: 'MENU.FACTURE_EMPLOYE', route: '/facture' },  
    { icon: 'local_offer', label: 'MENU.SERVICE' },
    { icon: 'dashboard', label: 'MENU.DASHBOARD' },
    { icon: 'exit_to_app', label: 'MENU.LOGOUT' } 
  ];

}
