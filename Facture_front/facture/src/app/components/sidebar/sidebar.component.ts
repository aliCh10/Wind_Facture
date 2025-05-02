import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() isMobile: boolean = false;
  @Input() menuItems: any[] = [];
  @Input() isSidebarActive: boolean = false;
  
  private openSubmenuLabel: string | null = null;

  constructor(
    private translate: TranslateService,
    private router: Router
  ) {}

  // Helper methods
  hasChildren(item: any): boolean {
    return item.children && item.children.length > 0;
  }

  isSubmenuOpen(label: string): boolean {
    return this.openSubmenuLabel === label;
  }

  isChildActive(item: any): boolean {
    return item.children?.some((child: any) => this.router.isActive(child.route, false));
  }

  // Event handlers
  handleMenuItemClick(event: Event, item: any): void {
    event.stopPropagation();
    
    if (item.route) {
      this.router.navigate([item.route]);
    }
    
    if (this.isMobile) {
      this.isSidebarActive = false;
    }
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  toggleSubmenu(label: string): void {
    if (this.openSubmenuLabel === label) {
      this.openSubmenuLabel = null;
    } else {
      this.openSubmenuLabel = label;
    }
  }
}
