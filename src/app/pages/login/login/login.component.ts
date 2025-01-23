import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

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

          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userRole', response.role); // Papel agora é "USER" ou "ADMIN"

          alert('Login realizado com sucesso!');

          // Redireciona com base no papel do usuário
          if (response.role === 'ADMIN') {
            localStorage.setItem('showAdminMenu', 'true'); // Habilita o slidebar
            this.router.navigate(['/home']); // Redireciona para o Home
          } else if (response.role === 'USER') {
            localStorage.setItem('showAdminMenu', 'false'); // Desabilita o sladebar
            this.router.navigate(['/home']); // Redireciona para o Home
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
