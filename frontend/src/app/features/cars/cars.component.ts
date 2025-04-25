import { Component } from '@angular/core';
import { CarFilterComponent } from "../car-filter/car-filter.component";
import { CardsComponent } from "../cards/cards.component";
import { CarDetailComponent } from '../../shared/car-detail/car-detail.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';



@Component({
  selector: 'app-cars',
  imports: [CarFilterComponent, CardsComponent, CarDetailComponent,CommonModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent {
  constructor(private router:Router) {  
  }

  loginPopup: boolean = false;
  handleLoginPopup() {
    this.loginPopup = true;
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  closeLoginPopup() {
    this.loginPopup = false;
  }

}
