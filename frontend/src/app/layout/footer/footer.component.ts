import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { RouterModule, Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [NgIf,RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  isLoggedIn: boolean;
  constructor(private authService: AuthService,public router: Router) {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
}
