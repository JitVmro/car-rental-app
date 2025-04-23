import { NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';

interface Location{
  name:string;
  address:string;
  image:string;
}

@Component({
  selector: 'app-map',
  imports: [NgFor,NgClass],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})


export class MapComponent {
  locations:Location[] = [
    {
      name: 'Kyiv Hyatt Hotel',
      address: '5, Ally Tarasovoyi st',
      image: 'assets/img/map1.png'
    },
    {
      name: 'Kyiv Fairmont',
      address: '2, Naberezhno-Khreshchatytska',
      image: 'assets/img/map2.png'
    },
    {
      name: 'Kyiv Premier Palace',
      address: '3, Tarasa Shevchenko Blvd',
      image: 'assets/img/map3.png'
    },
    {
      name: 'Kyiv Premier Palace',
      address: '3, Tarasa Shevchenko Blvd',
      image: 'assets/img/map4.png'
    },
    {
      name: 'Kyiv Premier Palace',
      address: '3, Tarasa Shevchenko Blvd',
      image: 'assets/img/map2.png'
    }
  ];

  selectedIndex = 0;

  selectLocation(index: number) {
    this.selectedIndex = index;
  }

  get selectedLocation():Location {
    return this.locations[this.selectedIndex];
  }

  get imgUrl():string {
    return this.selectedLocation.image;
}
}
