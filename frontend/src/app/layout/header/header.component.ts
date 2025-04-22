import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';


@Component({
  selector: 'app-header',
  imports: [NgIf, RouterModule, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // We get this from the getLoggedIn() from auth Service Later
  loggedIn: boolean;
  userImage:boolean = true;

  //We get this form the getCurrentUser() from the authService Later
  user: User | null;

  ham = false;
  toggleHam() {
    this.ham = !this.ham;
  }

  constructor(public router: Router, private authService: AuthService) {
    this.loggedIn = this.authService.isLoggedIn()
    this.user = this.authService.currentUserValue;
  }
  getName() {
    if(!this.user?.image){
      this.userImage=false;
      return (this.user?.name?.charAt(0)?.toUpperCase() ?? '') 
    }
    return null;
  }
}
