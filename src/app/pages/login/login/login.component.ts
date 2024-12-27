import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {  FormBuilder, FormGroup, Validators  } from '@angular/forms';
import {  Router  } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // constructor( public formBuilder: FormBuilder,
  //   private router: Router){

  //   }
  // loginForm : FormGroup;

  // ngOnInit(): void {
  //   this.loginForm = this.formBuilder.group
  //   {
  //     {
  //       email : ['', [Validators.required, Validators.email]]
  //       senha : ['', [Validators.required]]
  //      }
  //   }
  // }

  // get dadosForm(){
  //   return this.loginForm.controls;
  // }

  // loginUser(){
  //   alert("teste")
  // }

}
