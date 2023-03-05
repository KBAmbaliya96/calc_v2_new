import { Component, OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}
  @ViewChild('clientName') client_name!: ElementRef;
  loginForm: FormGroup = this.formBuilder.group({
    clientName: ['', Validators.required],
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });
  isClientNameFocused: boolean = false;
  isClientNameFilled: boolean = false;
  isUsernameFocused: boolean = false;
  isUsernameFilled: boolean = false;
  isPasswordFocused: boolean = false;
  isPasswordFilled: boolean = false;

  ngOnInit(): void {
    this.isClientNameFocused = this.isFieldFocused('focus');
  }

  ngAfterViewInit(): void {
    this.client_name.nativeElement.focus();
  }

  isFieldFocused(eventType: string): boolean {
    if (eventType === 'blur') {
      return false;
    }
    return true;
  }

  isFieldFilled(fieldName: string): boolean {
    if (
      !this.loginForm.get(fieldName)?.value &&
      this.loginForm.get(fieldName)?.value == ''
    ) {
      return false;
    }
    return true;
  }

  formSubmit(): boolean {
    if (!this.loginForm.value.clientName) {
      // Login form validation code write here
      console.error("Client name not valid!");
      return false;
    } else if (!this.loginForm.value.userName) {
      // Login form validation code write here
      console.error("Username not valid!");
      return false;
    } else if (!this.loginForm.value.password) {
      // Login form validation code write here
      console.error("Password not valid!");
      return false;
    }
    this.authService.logIn(this.loginForm.value);
    return true;
  }
}
