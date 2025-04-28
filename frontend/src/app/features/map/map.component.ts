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
      name: 'Kyiv Ukraine',
      address: '5, Ally Tarasovoyi st',
      image: 'assets/img/map6.png'
    },
    {
      name: 'Odesa Ukraine',
      address: 'Serednya St',
      image: 'assets/img/map7.png'
    },
    {
      name: 'Lviv Ukraine',
      address: 'Stefanya St, 5',
      image: 'assets/img/map8.png'
    },
    {
      name: 'Dnipro Ukraine',
      address: 'Troitska St, 5',
      image: 'assets/img/map9.png'
    },
    {
      name: 'Kharkiv Ukraine',
      address: 'Akademika Pavlova',
      image: 'assets/img/map10.png'
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
