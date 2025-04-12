import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone:false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isSidebarActive: boolean = false;
  isMobile: boolean = false;
  partnerId: number | null = null;
  sidebarMenuItems: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initRouteListener();
    this.initPartnerId();
    this.updateSidebarItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private updateSidebarItems(): void {
    const isSystemRoute = this.router.url.includes('/system');
  
    if (isSystemRoute) {
      this.sidebarMenuItems = [
        { icon: 'person', label: 'MENU.Partners', route: '/system' },
        { icon: 'settings', label: 'MENU.SETTINGS', route: '/settings' },
      ];
    } else {
      this.sidebarMenuItems = [
        { icon: 'home', label: 'MENU.HOME', route: '/home' },
        { 
          icon: 'receipt_long', 
          label: 'MENU.Modele ', 
          route: '/modele',
          children: [
            { label: 'MENU.NEW_FACTURE', route: '/facture/new' },
          ]
        },  
        { 
          icon: 'people', 
          label: 'MENU.Employé', 
          route: this.partnerId ? `/employee/${this.partnerId}` : '/employees' 
        },  
        { icon: 'description', label: 'MENU.SERVICES', route: '/services' },
        { icon: 'person', label: 'MENU.client', route: '/clients' },  
      ];
    }
  }
  

  toggleSidebar(): void {
    this.isSidebarActive = !this.isSidebarActive;
  }
}