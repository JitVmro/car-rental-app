export interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    category: string;
    gearboxType: string;
    engineType: string;
    seats: number;
    fuelConsumption: number;
    pricePerDay: number;
    rating: number;
    imageUrl: string;
    location: string;
    available: boolean;
    
  }
  export interface Feedback {
    id: number;
    userId: number;
    rating: number;
    comment: string;
    date: string;
  }