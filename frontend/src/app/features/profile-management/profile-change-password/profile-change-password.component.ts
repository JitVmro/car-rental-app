import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile/profile.service';

@Component({
  selector: 'app-profile-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-change-password.component.html',
})
export class ProfileChangePasswordComponent {
  @Input() userId: string = '';
  
  passwordForm: FormGroup;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showSuccessMessage: boolean = false;
  passwordError: boolean = false;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, { validators: this.passwordsNotEqual });
  }

  // Custom validator to check if passwords are different
  passwordsNotEqual(control: AbstractControl): ValidationErrors | null {
    const currentPassword = control.get('currentPassword')?.value;
    const newPassword = control.get('newPassword')?.value;
    
    if (currentPassword && newPassword && currentPassword === newPassword) {
      control.get('newPassword')?.setErrors({ sameAsOld: true });
      return { samePasswords: true };
    }
    
    // If there was a sameAsOld error but now passwords are different, clear it
    // (but keep any other errors like minlength)
    const newPasswordControl = control.get('newPassword');
    if (newPasswordControl?.hasError('sameAsOld') && currentPassword !== newPassword) {
      const errors = { ...newPasswordControl.errors };
      delete errors['sameAsOld'];
      
      // If no errors left, set to null, otherwise set remaining errors
      newPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
    }
    
    return null;
  }

  togglePasswordVisibility(field: 'current' | 'new'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else {
      this.showNewPassword = !this.showNewPassword;
    }
  }

  onSubmit(): void {
    if (this.passwordForm.valid && this.userId) {
      const passwordData = this.passwordForm.value;
      
      this.passwordError = false;
      this.errorMessage = '';
      this.isSubmitting = true;
      
      this.profileService.changePassword(this.userId, passwordData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showSuccessMessage = true;
          this.passwordForm.reset();
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error changing password', error);
          this.passwordError = true;
          
          // Handle different error scenarios
          if (error.status === 401) {
            this.errorMessage = 'Your session has expired. Please log in again.';
          } else if (error.status === 400) {
            this.errorMessage = error?.error?.message || 'The password is wrong! Try another one.';
          } else {
            this.errorMessage = 'Failed to change password. Please try again later.';
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.passwordForm.markAllAsTouched();
    }
  }
  
  // Helper method to check for specific errors
  hasError(controlName: string, errorName: string): boolean {
    return this.passwordForm.get(controlName)?.touched && 
           this.passwordForm.get(controlName)?.hasError(errorName) || false;
  }
  
  // Helper method to dismiss error message
  dismissError(): void {
    this.passwordError = false;
    this.errorMessage = '';
  }
}