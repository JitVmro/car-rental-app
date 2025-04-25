import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { CarsComponent } from './features/cars/cars.component';
import { BookingsComponent } from './features/bookings/bookings.component';
import { BookingPageComponent } from './features/booking-page/booking-page.component';
import { CarBookingEditComponent } from './features/car-booking-edit/car-booking-edit.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'cars', component: CarsComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'bookings/new', component: BookingsComponent },
  { path: 'cars/booking', component: BookingPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'bookings/edit', component: CarBookingEditComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
