import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CarsService {

  allCars: any = [];
  apiData: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get('https://trpcstt2r6.execute-api.eu-west-2.amazonaws.com/dev/cars').subscribe({
      next: (data) => {
        this.apiData = data;
        this.allCars = this.apiData.content;
        console.log(this.allCars);
      }
    })
  }
}
