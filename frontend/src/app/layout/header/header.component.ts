import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule,Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [NgIf,RouterModule,NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
   // We get this from the getLoggedIn() from auth Service Later
   loggedIn = false;

   //We get this form the getCurrentUser() from the authService Later
   user = {
     name: 'Anastasia',
     role: 'Client',
     avatarUrl: 'https://i.pravatar.cc/30' // sample avatar image
   };
 
   ham=false;
   toggleHam(){
     this.ham=!this.ham;
   }
 
   constructor(public router: Router) {}
}
