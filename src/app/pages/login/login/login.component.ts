import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { StorageService } from '../../../services/storage/storage.service'; // Importe o StorageService

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private storageService: StorageService, // Injete o StorageService
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          console.log('Login bem-sucedido:', response);

          // Salve os dados no StorageService
          this.storageService.setItem('authToken', response.token);
          this.storageService.setItem('userRole', response.role);

          alert('Login realizado com sucesso!');

          // Redirecione com base no papel do usuário
          if (response.role === 'ADMIN') {
            this.storageService.setItem('showAdminMenu', true); // Habilite o slidebar
            this.router.navigate(['/home']);
          } else if (response.role === 'USER') {
            this.storageService.setItem('showAdminMenu', false); // Desabilite o slidebar
            this.router.navigate(['/home']);
          } else {
            console.error(`Papel do usuário inválido: ${response.role}`);
            alert('Erro no papel do usuário. Entre em contato com o suporte.');
          }
        },
        error: (error) => {
          console.error('Erro ao fazer login:', error);
          alert('Falha no login. Verifique suas credenciais.');
        },
      });
    }
  }
}
