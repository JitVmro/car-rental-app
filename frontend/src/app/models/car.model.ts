export interface Car {
  carId: string;
  brand: string;
  model: string;
  year: string;
  category: string;
  gearBoxType: GearBoxType;
  engineType: string;
  engineCapacity: string
  seats: string;
  fuelConsumption: string;
  pricePerDay: number;
  imageURL: string;
  location: string;
  available: boolean;
  carRating: string;
  climateControlOption: ClimateControlOption;
  fuelType: FuelType;
  images: Array<string>;
  passengerCapacity: string;
  serviceRating: string;
  status: Status;
}

export interface Feedback {
  id: number;
  userId: number;
  rating: number;
  comment: string;
  date: string;
}

export interface CarFeature {
  icon: string;
  value: string | GearBoxType | FuelType | ClimateControlOption;
}

export enum ClimateControlOption {
  NONE = "None",
  AIR_CONDITIONER = "Air Condition",
  CLIMATE_CONTROL = "Climate Control",
  TWO_ZONE_CLIMATE_CONTROL = "Two Zone Climate Control"
}

export enum FuelType {
  PETROL = "Petrol",
  DIESEL = "Diesel",
  ELECTRIC = "Electric",
  HYBRID = "Hybrid"
}

export enum GearBoxType {
  MANUAL = "Manual",
  AUTOMATIC = "Automatic"
}

export enum Status {
  AVAILABLE = "Available",
  BOOKED = "Booked",
  UNAVAILABLE = "Unavailable"
}