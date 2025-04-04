import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUserName: string | null = null;
  

  ngOnInit(): void {

    
    if (typeof window !== 'undefined') {
      this.currentUserName = localStorage.getItem('name');
      console.log(localStorage.getItem('name'));
    }
  }
  

  
}
