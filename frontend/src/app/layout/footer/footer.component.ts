import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [NgIf],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  isLoggedIn: boolean;
  constructor(private authService: AuthService) {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
}
