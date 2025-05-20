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
export class NavComponent implements OnInit {
  @Input() isSidebarCollapsed: boolean = false;
  @Input() isSidebarActive: boolean = false;
  isMobile: boolean = false;
  isLargeScreen: boolean = false;

  userAvatar: string = 'assets/icons/user_default.jpg'; // Default avatar
  userName: string | null = localStorage.getItem('name');
  showUserDropdown: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    console.log('User Name:', localStorage.getItem('name'));
    this.loadCompanyLogo(); // Fetch company logo
  }

  // Fetch company logo from AuthService
  loadCompanyLogo(): void {
    this.authService.getCompanyInfo().subscribe({
      next: (companyInfo) => {
        if (companyInfo.logoUrl) {
          this.userAvatar = companyInfo.logoUrl;
        } else {
          console.warn('No logoUrl in company info, using default avatar');
        }
      },
      error: (error) => {
        console.error('Failed to load company info:', error);
        // Keep default avatar on error
      }
    });
  }

  checkScreenSize(): void {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== this.isMobile) {
      this.isMobile = newIsMobile;
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
    this.isSidebarActive = !this.isSidebarActive;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-account')) {
      this.showUserDropdown = false;
    }
  }
}