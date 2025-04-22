import { Routes } from '@angular/router';
import { CarsComponent } from './features/cars/cars.component';
import { BookingsComponent } from './features/bookings/bookings.component';

export const routes: Routes = [
    {path: 'cars',component:CarsComponent},
    {path:'bookings',component:BookingsComponent}
];
