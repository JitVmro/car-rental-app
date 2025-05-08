import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class SupportGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(): boolean {
    const user = this.authService.currentUserValue;
    console.log('Support guard checking user:', user); // Debug log
    
    if (user && (user.role === 'SupportAgent' || user.role === 'admin')) {
      return true;
    }
    
    // If not support agent or admin, redirect to home
    this.router.navigate(['/home']);
    return false;
  }
}