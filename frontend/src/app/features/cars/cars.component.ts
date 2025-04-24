import { Component } from '@angular/core';
import { CarFilterComponent } from "../car-filter/car-filter.component";
import { CardsComponent } from "../cards/cards.component";



@Component({
  selector: 'app-cars',
  imports: [CarFilterComponent, CardsComponent],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent {

}
