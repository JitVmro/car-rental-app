import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { CarsComponent } from './features/cars/cars.component';
import { BookingsComponent } from './features/bookings/bookings.component';
import { BookingPageComponent } from './features/booking-page/booking-page.component';
import { CarBookingEditComponent } from './features/car-booking-edit/car-booking-edit.component';
import { AuthGuard } from './core/guards/auth-guard.guard';
import { ProfileComponent } from './features/profile-management/profile/profile.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminGuard } from './core/guards/admin.guard';
import { SupportGuard } from './core/guards/support.guard';
// import { DashboardComponent } from './features/admin/dashboard/dashboard.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cars', component: CarsComponent },
  { path: 'dashboard', component: DashboardComponent ,  canActivate: [AuthGuard, AdminGuard]},
  { path: 'bookings/new', component: BookingsComponent,canActivate:[AuthGuard] },
  { path: 'bookings', component: BookingsComponent,canActivate:[AuthGuard,SupportGuard] },
  { path: 'cars/booking', component: BookingPageComponent,canActivate:[AuthGuard] },
  { path: 'bookings/edit', component: CarBookingEditComponent,canActivate:[AuthGuard] },
  { path: 'profile', component: ProfileComponent,canActivate:[AuthGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
