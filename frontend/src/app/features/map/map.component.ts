import { NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

interface Location {
  locationId: string;
  locationName: string;
  locationAddress: string;
  locationImageUrl: string;
}

@Component({
  selector: 'app-map',
  imports: [NgFor, NgClass, HttpClientModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})


export class MapComponent {

  baseUrl = environment.apiUrl;
  readonly mapsUrl = this.baseUrl + '/home/locations';
  constructor(private http: HttpClient) { }

  apiData: any = null;

  getLocations() {
    this.http.get(this.mapsUrl).subscribe({
      next: (data) => {
        this.apiData = data;
        this.locations = this.apiData.content // ✅ Now this logs the actual data from the API
        console.log(this.locations);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  ngOnInit() {
    this.getLocations();

  }

  locations: Location[] = [
    // {
    //   loactionName: 'Kyiv Ukraine',
    //   locationAddress: '5, Ally Tarasovoyi st',
    //   locationlmageUrl: 'assets/img/map6.png',
    //   locationId: '1'
    // },
    // {
    //   loactionName: 'Odesa Ukraine',
    //   locationAddress: 'Serednya St',
    //   locationlmageUrl: 'assets/img/map7.png',
    //   locationId: '2'
    // },
    // {
    //   loactionName: 'Lviv Ukraine',
    //   locationAddress: 'Stefanya St, 5',
    //   locationlmageUrl: 'assets/img/map8.png',
    //   locationId: '3'
    // },
    // {
    //   loactionName: 'Dnipro Ukraine',
    //   locationAddress: 'Troitska St, 5',
    //   locationlmageUrl: 'assets/img/map9.png',
    //   locationId: '4'
    // },
    // {
    //   loactionName: 'Kharkiv Ukraine',
    //   locationAddress: 'Akademika Pavlova',
    //   locationlmageUrl: 'assets/img/map10.png',
    //   locationId: '5'
    // }
  ];

  selectedIndex = 0;

  selectLocation(index: number) {
    this.selectedIndex = index;
  }

  get selectedLocation(): Location | null {
    return this.locations[this.selectedIndex];
  }

  get imgUrl(): string | undefined {
    return this.selectedLocation?.locationImageUrl;
  }
}
