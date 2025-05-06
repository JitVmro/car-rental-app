import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
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
      
      this.profileService.changePassword(this.userId, passwordData).subscribe({
        next: (response) => {
          this.showSuccessMessage = true;
          this.passwordForm.reset();
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
        },
        error: (error) => {
          console.error('Error changing password', error);
          this.passwordError = true;
          this.errorMessage = error?.error?.message || 'The password is wrong! Try another one.';
        }
      });
    }
  }
}