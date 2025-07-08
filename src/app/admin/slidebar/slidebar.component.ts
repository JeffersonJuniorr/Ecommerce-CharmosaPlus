import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  standalone: true,
  selector: 'app-slidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './slidebar.component.html',
  styleUrl: './slidebar.component.css',
})
export class SlidebarComponent implements OnInit {
  isCollapsed: boolean = true;
  isAdmin: boolean = false;

  @Output() collapsedChange = new EventEmitter<boolean>();

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    const userRole = this.storageService.getItem('userRole');
    this.isAdmin = userRole === 'ADMIN';
    this.isCollapsed = true;

    // Emite o estado inicial para o pai
    this.collapsedChange.emit(this.isCollapsed);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;

    // Emite o novo estado (true ou false) sempre que o botão é clicado
    this.collapsedChange.emit(this.isCollapsed);
  }
}
