import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent  implements OnInit{
  @Input() isSidebarCollapsed: boolean = false;
  
  userAvatar: string = 'assets/icons/user_default.jpg';
  userName: string | null = localStorage.getItem('name');  showUserDropdown: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}
  
ngOnInit(): void {
  console.log(localStorage.getItem('name'));

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

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-account')) {
      this.showUserDropdown = false;
    }
  }
}