import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  hidePassword = true;
  registrationSuccess = false;
  returnUrl = '/';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
    this.registrationSuccess =
      this.route.snapshot.queryParams['registered'] === 'true';
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      this.errorMessage = null;
    });
  }

  onSubmit(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
  
    this.isSubmitting = true;
    this.errorMessage = null;
  
    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        // Check user role and redirect accordingly
        if (user && user.role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          // For non-admin users or if returnUrl is specified
          this.router.navigate([this.returnUrl !== '/' ? this.returnUrl : '/home']);
        }
        console.log('Login Success');
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
