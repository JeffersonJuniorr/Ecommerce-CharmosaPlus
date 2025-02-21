import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { StorageService } from '../../../services/storage/storage.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomSnackBarComponent } from '../../../components/custom/custom-snack-bar/custom-snack-bar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule,  MatProgressBarModule],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  showAlert(message: string, isError: boolean = false) {
    this.snackBar.openFromComponent(CustomSnackBarComponent, {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar', 'custom-snackbar'] : ['success-snackbar', 'custom-snackbar'],
      data: { message }
    });
  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.storageService.setItem('authToken', response.token);
          this.storageService.setItem('userRole', response.role);

          const message = response.role === 'ADMIN' 
            ? 'Login realizado com sucesso! Bem-vindo, Administrador!'
            : 'Login realizado com sucesso!';
            
          this.showAlert(message);

          if (response.role === 'ADMIN') {
            this.storageService.setItem('showAdminMenu', true);
            this.router.navigate(['/home']);
          } else if (response.role === 'USER') {
            this.storageService.setItem('showAdminMenu', false);
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          console.error('Erro ao fazer login:', error);
          this.showAlert('Falha no login. Verifique suas credenciais.', true);
        },
      });
    }
  }
}
