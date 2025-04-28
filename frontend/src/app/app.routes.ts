import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { CarsComponent } from './features/cars/cars.component';
import { BookingsComponent } from './features/bookings/bookings.component';
import { BookingPageComponent } from './features/booking-page/booking-page.component';
import { CarBookingEditComponent } from './features/car-booking-edit/car-booking-edit.component';
import { AuthGuard } from './core/guards/auth-guard.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cars', component: CarsComponent },
  { path: 'bookings/new', component: BookingsComponent,canActivate:[AuthGuard] },
  { path: 'bookings', component: BookingsComponent,canActivate:[AuthGuard] },
  { path: 'cars/booking', component: BookingPageComponent,canActivate:[AuthGuard] },
  { path: 'bookings/edit', component: CarBookingEditComponent,canActivate:[AuthGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
