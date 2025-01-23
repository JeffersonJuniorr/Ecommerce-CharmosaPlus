import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  imports: [CommonModule],
})
export class UsersComponent implements OnInit {
  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<any[]>('/api/users').subscribe(
      (data) => (this.users = data),
      (error) => console.error('Erro ao buscar usuários:', error)
    );
  }

  removeUser(userId: string) {
    this.http.delete(`/api/users/${userId}`).subscribe(
      () => (this.users = this.users.filter((user) => user.id !== userId)),
      (error) => console.error('Erro ao remover usuário:', error)
    );
  }
}
