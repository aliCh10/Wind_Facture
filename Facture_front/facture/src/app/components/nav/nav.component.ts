import { Component, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  exportAs: 'navbar'
})
export class NavComponent implements OnInit, OnDestroy {
  @Input() isSidebarCollapsed: boolean = false;
  @Input() isSidebarActive: boolean = false;
  isMobile: boolean = false;
  isLargeScreen: boolean = false;

  userAvatar: string = 'assets/icons/user_default.jpg';
  userName: string | null = null; // Initialize to null
  showUserDropdown: boolean = false;
  private userNameSubscription!: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.loadCompanyLogo();
    this.loadUserName(); // Fetch name from profile

    // Subscribe to name updates
    this.userNameSubscription = this.authService.getUserNameObservable().subscribe(name => {
      this.userName = name;
    });
  }

  ngOnDestroy(): void {
    this.userNameSubscription.unsubscribe();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  loadUserName(): void {
    const role = this.authService.getUserRole();
    if (role === 'PARTNER') {
      this.authService.getPartnerProfile().subscribe({
        next: (profile) => {
          this.userName = profile.name || null;
          this.authService.updateUserName(this.userName); // Sync with BehaviorSubject
          console.log('Partner name loaded:', this.userName);
        },
        error: (error) => {
          console.error('Failed to load partner profile:', error);
          this.userName = null;
        }
      });
    } else if (role === 'EMPLOYE') {
      this.authService.getEmployeeProfile().subscribe({
        next: (profile) => {
          this.userName = profile.name || null;
          this.authService.updateUserName(this.userName); // Sync with BehaviorSubject
          console.log('Employee name loaded:', this.userName);
        },
        error: (error) => {
          console.error('Failed to load employee profile:', error);
          this.userName = null;
        }
      });
    } else {
      this.userName = null;
    }
  }

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
  logout(): void {
    this.authService.logout();
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