import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage/storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomSnackBarComponent } from '../../../components/custom/custom-snack-bar/custom-snack-bar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { NumbersOnlyDirective } from '../../../directives/numbers-only.directive';


@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, MatSnackBarModule, MatProgressBarModule, CommonModule, NumbersOnlyDirective],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
  ) {
     this.registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
      Validators.minLength(10),
      Validators.maxLength(11)
    ]],
    cep: ['', [
      Validators.required,
      Validators.pattern('^[0-9]{8}$'),
    ]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    gender: ['', Validators.required],
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
    console.log('Tentando registrar:', this.registerForm.value);
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registro bem-sucedido:', response);
  
          this.showAlert(response.message);
  
          this.storageService.setItem('welcomeMessage', 'Conta criada com sucesso!');
          this.storageService.setItem('registeredUser', this.registerForm.value.username);
  
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err) => {
          console.error('Erro ao registrar:', err);
  
          const errorMessage = err.error || 'Erro ao criar conta. Verifique os dados e tente novamente.';
          this.showAlert(errorMessage, true);
        },
      });
    } else {
      this.showAlert('Por favor, preencha todos os campos corretamente.', true);
      
      // Opcional: Destacar campos inválidos
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
