import { Routes } from '@angular/router';
import { CarsComponent } from './features/cars/cars.component';
import { BookingsComponent } from './features/bookings/bookings.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    {path:'',component:HomeComponent},
    {path: 'cars',component:CarsComponent},
    {path:'bookings',component:BookingsComponent}
];
