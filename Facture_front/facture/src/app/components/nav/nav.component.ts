import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  exportAs: 'navbar'
})
export class NavComponent  implements OnInit{
  @Input() isSidebarCollapsed: boolean = false;
  @Input() isSidebarActive: boolean = false;
  isMobile: boolean = false;

  isLargeScreen: boolean = false;

  
  userAvatar: string = 'assets/icons/user_default.jpg';
  userName: string | null = localStorage.getItem('name');  showUserDropdown: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}
  
ngOnInit(): void {
  this.checkScreenSize();
  window.addEventListener('resize', () => this.checkScreenSize());
  console.log(localStorage.getItem('name'));

}
checkScreenSize(): void {
  const newIsMobile = window.innerWidth <= 768;
  if (newIsMobile !== this.isMobile) {
    this.isMobile = newIsMobile;
    // Si on passe en mode mobile, on s'assure que le sidebar est fermé
    if (!this.isMobile && this.isSidebarActive) {
      this.isSidebarActive = false;
    }
  }
}
  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  openSettings(): void {
    console.log('Settings clicked');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    
 
    
    this.router.navigate(['/signin']);
    
    console.log('User logged out successfully');
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;  // Bascule l'état du sidebar
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-account')) {
      this.showUserDropdown = false;
    }
  }
}