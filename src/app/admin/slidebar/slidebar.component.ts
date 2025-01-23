import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-slidebar',
  imports: [CommonModule],
  templateUrl: './slidebar.component.html',
  styleUrl: './slidebar.component.css'
})
export class SlidebarComponent implements OnInit {
  isCollapsed: boolean = false;
  isAdmin: boolean = false;

  ngOnInit() {
    const userRole = localStorage.getItem('userRole');
    this.isAdmin = userRole === 'ADMIN';
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
