
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileInfoComponent } from '../profile-info/profile-info.component';
import { ProfileChangePasswordComponent } from '../profile-change-password/profile-change-password.component';
import { DocumentsComponent } from '../documents/documents.component';
import { AuthService } from '../../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProfileInfoComponent,
    ProfileChangePasswordComponent,
    DocumentsComponent
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'personal-info';
  userId: string = '';
  userObject: any;

  constructor() {}

  ngOnInit(): void {
    // Get user object from local storage
    const userString = localStorage.getItem('currentUser');
    
    if (userString) {
      try {
        this.userObject = JSON.parse(userString);
        console.log(this.userObject);
        
        this.userId = this.userObject.id || this.userObject._id || '';
        
        console.log(this.userId);
        // If there's no ID in the user object, you might want to handle this case
        if (!this.userId) {
          console.error('User ID not found in stored user object');
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    } else {
      console.error('No user found in localStorage');
      // You might want to redirect to login page or handle this case
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}