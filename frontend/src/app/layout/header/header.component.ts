import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-header',
  imports: [NgIf, RouterModule, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  loggedIn: boolean;
  isProfileMenuOpen = false;
  userImage: boolean = true;
  isAdmin: boolean = false;
  isSupportAgent: boolean = false;

  user: User | null;

  ham = false;
  toggleHam() {
    this.ham = !this.ham;
  }

  constructor(public router: Router, private authService: AuthService) {
    this.loggedIn = this.authService.isLoggedIn();
    this.user = this.authService.currentUserValue;
    this.isAdmin = this.user?.role === 'admin';
    this.isSupportAgent = this.user?.role === 'SupportAgent';
  }
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.loggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.isSupportAgent = user?.role === 'SupportAgent';
      this.userImage = this.user?.image ? true : false;
    });
  }
  
  getName() {
    if (!this.user?.image) {
      this.userImage = false;
      return this.user?.name?.charAt(0)?.toUpperCase() ?? '';
    }
    return null;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeProfileMenu();
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
    this.closeProfileMenu();
  }

  navigateToBookings(): void {
    this.router.navigate(['/bookings']);
    this.closeProfileMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeProfileMenu();
    
    // First navigate to home
    this.router.navigate(['/home']).then(() => {
      // After navigation is complete, refresh the page to ensure all auth states are reset
      window.location.href = '/home';
    });
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;

    const profileSection = document.querySelector('.profile-section');
    if (
      profileSection &&
      !profileSection.contains(clickedElement) &&
      this.isProfileMenuOpen
    ) {
      this.closeProfileMenu();
    }
  }
}