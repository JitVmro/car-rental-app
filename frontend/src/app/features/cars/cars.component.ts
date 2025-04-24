import { Component } from '@angular/core';
import { CarFilterComponent } from "../car-filter/car-filter.component";
import { CardsComponent } from "../cards/cards.component";
import { CarDetailComponent } from '../../shared/car-detail/car-detail.component';



@Component({
  selector: 'app-cars',
  imports: [CarFilterComponent, CardsComponent, CarDetailComponent],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent {

}
