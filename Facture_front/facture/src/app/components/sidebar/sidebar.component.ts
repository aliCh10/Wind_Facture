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
  showChildren: boolean = false;

  constructor(private translate: TranslateService, private router: Router) {}

  selectMenuItem(item: any) {
    if (item.route) {
      this.router.navigate([item.route]);
    }
    if (this.isMobile) {
      this.isSidebarActive = false;
      this.showChildren = false;
    }
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }

}
