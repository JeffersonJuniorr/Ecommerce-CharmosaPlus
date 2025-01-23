import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage/storage.service'; // Importa o StorageService

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService // Injeta o StorageService
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      gender: ['', Validators.required],
      cep: ['', Validators.required],
    });
  }

  onSubmit() {
    console.log('Tentando registrar:', this.registerForm.value);
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registro bem-sucedido:', response);

          // Salva dados no localStorage usando StorageService
          this.storageService.setItem('welcomeMessage', 'Conta criada com sucesso!');
          this.storageService.setItem('registeredUser', response.username); // Exemplo de dado retornado pelo back-end

          alert('Conta criada com sucesso!');
          this.router.navigate(['/login']); // Redireciona para o login
        },
        error: (err) => {
          console.error('Erro ao registrar:', err);
          alert('Erro ao criar conta. Verifique os dados e tente novamente.');
        },
      });
    } else {
      alert('Por favor, preencha todos os campos corretamente.');
    }
  }
}
