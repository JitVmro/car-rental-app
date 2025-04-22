import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { AppComponent } from './app.component';
import { CarsPageComponent } from './features/cars-page/cars-page.component';
import { BookingPageComponent } from './features/booking-page/booking-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'all-cars', component: CarsPageComponent },
  { path: 'all-cars/booking/:id', component: BookingPageComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
