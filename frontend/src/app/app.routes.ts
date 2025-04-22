import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CarsPageComponent } from './features/cars-page/cars-page.component';
import { BookingPageComponent } from './features/booking-page/booking-page.component';

export const routes: Routes = [
    // { path: '', component: AppComponent },
    { path: 'all-cars', component: CarsPageComponent },
    { path: 'all-cars/booking/:id', component: BookingPageComponent },
];
