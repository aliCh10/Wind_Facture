import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() isSidebarActive: boolean = false;
  @Input() isMobile: boolean = false;
  @Input() menuItems: any[] = [];

  constructor(private translate: TranslateService) {}

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  selectMenuItem(item: any) {
    console.log('Selected:', this.getTranslation(item.label));
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;  // Bascule l'état du sidebar
  }
}
