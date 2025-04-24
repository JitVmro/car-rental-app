import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, this.nameValidator]],
        surname: ['', [Validators.pattern(/^[a-zA-Z\s]*$/)]],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordStrengthValidator,
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }
  ngOnInit() {
    // Trigger validation when either password field changes
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });

    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);

    if (!hasUpperCase || !hasDigit) {
      return {
        passwordStrength: {
          hasUpperCase: hasUpperCase,
          hasDigit: hasDigit,
        },
      };
    }

    return null;
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    if (value.trim().length === 0) {
      return { whitespace: true };
    }

    const pattern = /^[a-zA-Z\s]+$/;
    if (!pattern.test(value)) {
      return { pattern: true };
    }

    return null;
  }
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    // Get the confirmPassword control
    const confirmControl = control.get('confirmPassword');

    if (password && confirmPassword && password !== confirmPassword) {
      // Set the error if passwords don't match
      confirmControl?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Clear the passwordMismatch error if passwords match
      // but preserve any other errors the confirmPassword field might have
      if (confirmControl?.errors) {
        const errors = { ...confirmControl.errors };
        delete errors['passwordMismatch'];

        // If there are other errors, set them back
        if (Object.keys(errors).length > 0) {
          confirmControl.setErrors(errors);
        } else {
          // If no other errors, clear errors completely
          confirmControl.setErrors(null);
        }
      }
      return null;
    }
  }

  onSubmit(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });

    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const userData = {
      name: this.registerForm.get('name')?.value,
      surname: this.registerForm.get('surname')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true', email: userData.email },
        });
      },
      error: (error) => {
        if (error.message === 'Email already registered') {
          this.registerForm
            .get('email')
            ?.setErrors({ alreadyRegistered: true });
        }
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else if (field === 'confirmPassword') {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
