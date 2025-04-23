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

  user: User | null;

  ham = false;
  toggleHam() {
    this.ham = !this.ham;
  }

  constructor(public router: Router, private authService: AuthService) {
    this.loggedIn = this.authService.isLoggedIn();
    this.user = this.authService.currentUserValue;
  }
  ngOnInit(): void {
    this.userImage = this.user?.image ? true : false;
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeProfileMenu();
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
