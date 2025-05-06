// personal-info.component.ts
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
  showSuccessMessage: boolean = false;
  userName: string = '';

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
    // If we have a userObject from input, use that data

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
      },
      error: (error) => {
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
      const userData = this.userForm.value;
      console.log(userData);

      this.profileService.updateUserInfo(this.userId, userData).subscribe({
        next: (response) => {
          const storedData = JSON.parse(
            localStorage.getItem('currentUser') || ''
          );
          const updatedUser = {
            ...storedData,
            ...userData,
            name: userData.firstName + ' ' + userData.lastName,
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
            window.location.reload();
          }, 5000);
        },
        error: (error) => {
          console.error('Error updating user info', error);
        },
      });
    }
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64Url = reader.result as string;
      this.imageUrl = base64Url;

      // Save to localStorage if needed
      this.profileService
        .updateUserInfo(this.userId, { imageUrl: base64Url })
        .subscribe({
          next: (res) => {
            const storedData = JSON.parse(
              localStorage.getItem('currentUser') || ''
            );
            const updatedUser = {
              ...storedData,
              image: base64Url,
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            window.location.reload();
          },
        });
    };

    reader.readAsDataURL(file);
  }
}
