// core/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth-service.service';

// core/guards/admin.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    
    // Make sure we're checking the role case-insensitively
    if (currentUser && currentUser.role?.toLowerCase() === 'admin') {
      return true;
    }
    
    // Not an admin, redirect to home
    this.router.navigate(['/home']);
    return false;
  }
}