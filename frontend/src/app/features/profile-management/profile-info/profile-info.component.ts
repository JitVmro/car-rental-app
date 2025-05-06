import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProfileService } from '../../../core/services/profile/profile.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-info.component.html',
})
export class ProfileInfoComponent implements OnInit {
  @Input() userId: string = '';
  @Input() userObject: any;

  userForm: FormGroup;
  imageUrl: string = '';
  userEmail: string = '';
  userName: string = '';
  
  // Error and success handling
  isLoading: boolean = false;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  errorMessage: string = '';
  formSubmitting: boolean = false;
  imageUploading: boolean = false;

  constructor(private fb: FormBuilder, private profileService: ProfileService) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      country: [''],
      city: [''],
      postalCode: [''],
      street: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.showErrorMessage = false;

    this.profileService.getUserInfo(this.userId).subscribe({
      next: (userData) => {
        this.userForm.patchValue({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phoneNumber || '',
          country: userData.country || '',
          city: userData.city || '',
          postalCode: userData.postalCode || '',
          street: userData.street || '',
        });

        this.imageUrl = userData.imageUrl || '';
        this.userEmail = userData.email || '';
        this.userName = userData.firstName;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.showErrorMessage = true;
        this.errorMessage = 'Failed to load profile data. Please try refreshing the page.';
        console.error('Error loading user data', error);
      },
    });
  }
  
  get userInitial(): string {
    return this.userName?.[0]?.toUpperCase() || '';
  }

  get randomColor(): string {
    const colors = [
      '#F44336',
      '#E91E63',
      '#9C27B0',
      '#3F51B5',
      '#03A9F4',
      '#009688',
      '#4CAF50',
      '#FF9800',
      '#795548',
    ];
    const index = this.userInitial.charCodeAt(0) % colors.length;
    return colors[index]; // consistent color based on letter
  }

  onSubmit(): void {
    if (this.userForm.valid && this.userId) {
      this.formSubmitting = true;
      this.showErrorMessage = false;
      this.showSuccessMessage = false;
      
      const userData = this.userForm.value;
      console.log(userData);

      this.profileService.updateUserInfo(this.userId, userData).subscribe({
        next: (response) => {
          try {
            const storedData = JSON.parse(
              localStorage.getItem('currentUser') || '{}'
            );
            const updatedUser = {
              ...storedData,
              ...userData,
              name: userData.firstName + ' ' + userData.lastName,
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          } catch (e) {
            console.error('Error updating local storage', e);
          }

          this.formSubmitting = false;
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
        },
        error: (error) => {
          this.formSubmitting = false;
          this.showErrorMessage = true;
          
          if (error.status === 401) {
            this.errorMessage = 'Your session has expired. Please log in again.';
          } else if (error.status === 400) {
            this.errorMessage = 'Please check your information and try again.';
          } else {
            this.errorMessage = 'Failed to update profile. Please try again later.';
          }
          
          console.error('Error updating user info', error);
        },
      });
    } else {
      // Form validation errors
      this.showErrorMessage = true;
      this.errorMessage = 'Please fill in all required fields correctly.';
      
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      this.showErrorMessage = true;
      this.errorMessage = 'Image size should be less than 1MB.';
      return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      this.showErrorMessage = true;
      this.errorMessage = 'Only image files are allowed.';
      return;
    }
    
    this.imageUploading = true;
    this.showErrorMessage = false;
    
    const reader = new FileReader();

    reader.onload = () => {
      const base64Url = reader.result as string;
      this.imageUrl = base64Url;

      // Save to localStorage if needed
      this.profileService
        .updateUserInfo(this.userId, { imageUrl: base64Url })
        .subscribe({
          next: (res) => {
            try {
              const storedData = JSON.parse(
                localStorage.getItem('currentUser') || '{}'
              );
              const updatedUser = {
                ...storedData,
                image: base64Url,
              };
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            } catch (e) {
              console.error('Error updating local storage', e);
            }
            
            this.imageUploading = false;
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 5000);
          },
          error: (error) => {
            this.imageUploading = false;
            this.showErrorMessage = true;
            this.errorMessage = 'Failed to upload profile image. Please try again.';
            console.error('Error updating profile image', error);
          }
        });
      };
      
      reader.onerror = () => {
        this.imageUploading = false;
        this.showErrorMessage = true;
        this.errorMessage = 'Failed to read the image file. Please try another image.';
      };
      
      reader.readAsDataURL(file);
  }
  
  dismissError(): void {
    this.showErrorMessage = false;
  }
}