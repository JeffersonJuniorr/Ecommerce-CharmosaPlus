import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  standalone: true,
  selector: 'app-slidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './slidebar.component.html',
  styleUrl: './slidebar.component.css'
})
export class SlidebarComponent implements OnInit {
  isCollapsed: boolean = false;
  isAdmin: boolean = false;

  constructor(private router: Router, private storageService: StorageService) {}
  
  navigate(route: string): void {
    this.router.navigate([route]);
  }

  ngOnInit() {
    const userRole = this.storageService.getItem('userRole');
    this.isAdmin = userRole === 'ADMIN';
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
