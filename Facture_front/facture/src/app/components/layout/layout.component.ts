import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isSidebarActive: boolean = false;
  isMobile: boolean = false;
  partnerId: number | null = null;
  sidebarMenuItems: any[] = [];
  private destroy$ = new Subject<void>();
  private userRole: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.checkMobile();
    this.initRouteListener();
    this.initPartnerId();
    this.initUserRole();
    this.updateSidebarItems();

    // Subscribe to role changes
    this.authService.getUserRoleObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(role => {
        this.userRole = role;
        this.updateSidebarItems(); // Update sidebar when role changes
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isSidebarActive = true;
    }
  }

  private initRouteListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateSidebarItems();
      });
  }

  private initPartnerId(): void {
    const storedPartnerId = localStorage.getItem('partnerId');
    this.partnerId = storedPartnerId ? +storedPartnerId : null;
  }

  private initUserRole(): void {
    this.userRole = this.authService.getUserRole(); // Use AuthService to get initial role
  }

  private updateSidebarItems(): void {
    const isSystemRoute = this.router.url.includes('/system');

    if (isSystemRoute) {
      this.sidebarMenuItems = [
        { icon: 'person', label: 'MENU.Partners', route: '/system' },
        { icon: 'settings', label: 'MENU.SETTINGS', route: '/settings' }
      ];
    } else {
      const menuItems = [
        { icon: 'home', label: 'MENU.HOME', route: '/home' },
        {
          icon: 'payment',
          label: 'MENU.invoice',
          route: '/facturation',
          children: [
            { icon: 'description', label: 'MENU.Modele', route: 'modele' },
            { icon: 'list_alt', label: 'MENU.models_list', route: 'models' },
            // { icon: 'add_circle', label: 'MENU.Create Invoice', route: 'creer-facture' },
            { icon: 'receipt', label: 'MENU.invoices_list', route: 'factures' }
          ]
        },
        { icon: 'description', label: 'MENU.SERVICES', route: '/services' },
        { icon: 'person', label: 'MENU.Client', route: '/clients' }
      ];

      // Add "Employé" menu item only if the user is not ROLE_EMPLOYE
      if (this.userRole !== 'EMPLOYE') {
        menuItems.splice(2, 0, {
          icon: 'people',
          label: 'MENU.Employé',
          route: this.partnerId ? `/employee/${this.partnerId}` : '/employees'
        });
      }

      this.sidebarMenuItems = menuItems;
    }
  }

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }
}