import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { RouterModule, Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [NgIf, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  isLoggedIn: boolean;
  isAdmin: boolean = false;
  isSupportAgent: boolean = false;
  
  constructor(private authService: AuthService, public router: Router) {
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.currentUserValue;
    this.isAdmin = user?.role === 'admin';
    this.isSupportAgent = user?.role === 'SupportAgent';
  }
  
  ngOnInit(): void {
    // Subscribe to auth changes to update admin status
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.isSupportAgent = user?.role === 'SupportAgent';
    });
  }
}