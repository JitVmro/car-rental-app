import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Car, ClimateControlOption, FuelType, GearBoxType, Status } from '../../models/car.model';
import { FilterCriteria } from '../../models/filter.model';

@Injectable({
  providedIn: 'root'
})
export class CarFilterService {
  // BehaviorSubject to store and emit the filtered cars
  private filteredCarsSubject = new BehaviorSubject<Car[]>([]);

  // Observable that components can subscribe to
  filteredCars$: Observable<Car[]> = this.filteredCarsSubject.asObservable();

  // Mock cars data
  private mockCars: Car[] = [
    {
      carId: '1',
      brand: 'Nissan',
      model: 'Z',
      year: '2024',
      category: 'Passenger car',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Gasoline',
      engineCapacity: '3.0L',
      seats: '2',
      fuelConsumption: '10',
      pricePerDay: '550',
      carRating: '4.8',
      imageURL: '/assets/images/Nissan-Z-2021.jpg',
      location: 'Ukraine, Kyiv',
      available: true,
      climateControlOption: ClimateControlOption.AIR_CONDITIONER,
      fuelType: FuelType.PETROL,
      images: ['/assets/images/Nissan-Z-2021.jpg'],
      passengerCapacity: '2',
      serviceRating: '4.7',
      status: Status.AVAILABLE
    },
    {
      carId: '2',
      brand: 'Audi',
      model: 'A6 Quattro',
      year: '2023',
      category: 'Sedan',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Petrol',
      engineCapacity: '2.0L',
      seats: '5',
      fuelConsumption: '8',
      pricePerDay: '180',
      carRating: '4.8',
      imageURL: 'assets/images/Audi-rs7-2022.jpg',
      location: 'Ukraine, Kyiv',
      available: true,
      climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
      fuelType: FuelType.PETROL,
      images: ['assets/images/Audi-rs7-2022.jpg'],
      passengerCapacity: '5',
      serviceRating: '4.8',
      status: Status.AVAILABLE
    },
    {
      carId: '3',
      brand: 'Ford',
      model: 'Focus',
      year: '2019',
      category: 'Hatchback',
      gearBoxType: GearBoxType.MANUAL,
      engineType: 'Diesel',
      engineCapacity: '1.5L',
      seats: '5',
      fuelConsumption: '6',
      pricePerDay: '110',
      carRating: '4.8',
      imageURL: 'assets/images/ford-focus.jpg',
      location: 'Ukraine, Lviv',
      available: true,
      climateControlOption: ClimateControlOption.AIR_CONDITIONER,
      fuelType: FuelType.DIESEL,
      images: ['assets/images/ford-focus.jpg'],
      passengerCapacity: '5',
      serviceRating: '4.6',
      status: Status.AVAILABLE
    },
    {
      carId: '4',
      brand: 'Jeep',
      model: 'Grand Cherokee',
      year: '2020',
      category: 'SUV',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Petrol',
      engineCapacity: '3.6L',
      seats: '5',
      fuelConsumption: '12',
      pricePerDay: '220',
      carRating: '4.8',
      imageURL: 'assets/images/jeep.jpg',
      location: 'Ukraine, Odesa',
      available: true,
      climateControlOption: ClimateControlOption.CLIMATE_CONTROL,
      fuelType: FuelType.PETROL,
      images: ['assets/images/jeep.jpg'],
      passengerCapacity: '5',
      serviceRating: '4.7',
      status: Status.AVAILABLE
    },
    {
      carId: '5',
      brand: 'Tesla',
      model: 'Model 3',
      year: '2022',
      category: 'Sedan',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Electric',
      engineCapacity: 'N/A',
      seats: '5',
      fuelConsumption: '0',
      pricePerDay: '300',
      carRating: '4.9',
      imageURL: 'assets/images/tesla-model3.jpg',
      location: 'Ukraine, Kyiv',
      available: true,
      climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
      fuelType: FuelType.ELECTRIC,
      images: ['assets/images/tesla-model3.jpg'],
      passengerCapacity: '5',
      serviceRating: '4.9',
      status: Status.AVAILABLE
    },
    {
      carId: '6',
      brand: 'BMW',
      model: 'X5',
      year: '2021',
      category: 'SUV',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Diesel',
      engineCapacity: '3.0L',
      seats: '7',
      fuelConsumption: '9',
      pricePerDay: '280',
      carRating: '4.7',
      imageURL: 'assets/images/bmw-x5.jpg',
      location: 'Ukraine, Kharkiv',
      available: true,
      climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
      fuelType: FuelType.DIESEL,
      images: ['assets/images/bmw-x5.jpg'],
      passengerCapacity: '7',
      serviceRating: '4.8',
      status: Status.AVAILABLE
    },
    {
      carId: '7',
      brand: 'Toyota',
      model: 'Corolla',
      year: '2022',
      category: 'Sedan',
      gearBoxType: GearBoxType.MANUAL,
      engineType: 'Gasoline',
      engineCapacity: '1.8L',
      seats: '5',
      fuelConsumption: '7',
      pricePerDay: '120',
      carRating: '4.5',
      imageURL: 'assets/images/toyota-corolla.jpg',
      location: 'Ukraine, Lviv',
      available: true,
      climateControlOption: ClimateControlOption.AIR_CONDITIONER,
      fuelType: FuelType.PETROL,
      images: ['assets/images/toyota-corolla.jpg'],
      passengerCapacity: '5',
      serviceRating: '4.6',
      status: Status.AVAILABLE
    },
    {
      carId: '8',
      brand: 'Mercedes',
      model: 'C-Class',
      year: '2023',
      category: 'Sedan',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Gasoline',
      engineCapacity: '2.0L',
      seats: '5',
      fuelConsumption: '8',
      pricePerDay: '250',
      carRating: '4.8',
      imageURL: 'assets/images/mercedes-c.jpg',
      location: 'Ukraine, Kyiv',
      available: true,
      climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
      fuelType: FuelType.PETROL,
      images: ['assets/images/mercedes-c.jpg'],
      passengerCapacity: '5',
      serviceRating: '4.9',
      status: Status.AVAILABLE
    },
    {
      carId: '9',
      brand: 'Honda',
      model: 'Civic',
      year: '2021',
      category: 'Hatchback',
      gearBoxType: GearBoxType.MANUAL,
      engineType: 'Gasoline',
      engineCapacity: '1.5L',
      seats: '5',
      fuelConsumption: '6',
      pricePerDay: '100',
      carRating: '4.6',
      imageURL: 'assets/images/honda-civic.jpg',
      location: 'Ukraine, Odesa',
      available: true,
      climateControlOption: ClimateControlOption.AIR_CONDITIONER,
      fuelType: FuelType.PETROL,
      images: ['assets/images/honda-civic.jpg'],
      passengerCapacity: '5',
      serviceRating: '4.5',
      status: Status.AVAILABLE
    },
    {
      carId: '10',
      brand: 'Volkswagen',
      model: 'Golf',
      year: '2022',
      category: 'Hatchback',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Diesel',
      engineCapacity: '2.0L',
      seats: '5',
      fuelConsumption: '5',
      pricePerDay: '130',
      carRating: '4.7',
      imageURL: 'assets/images/vw-golf.jpg',
      location: 'Ukraine, Lviv',
      available: true,
      climateControlOption: ClimateControlOption.CLIMATE_CONTROL,
      fuelType: FuelType.DIESEL,
      images: ['assets/images/vw-golf.jpg'],
      passengerCapacity: '5',
      serviceRating: '4.6',
      status: Status.AVAILABLE
    },
    {
      carId: '11',
      brand: 'Porsche',
      model: '911',
      year: '2023',
      category: 'Sports',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Gasoline',
      imageURL: 'assets/images/porsche-911-2021.jpg',
      engineCapacity: '3.0L',
      seats: '2',
      fuelConsumption: '12',
      pricePerDay: '700',
      carRating: '4.9',
      location: 'Ukraine, Kyiv',
      available: true,
      climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
      fuelType: FuelType.PETROL,
      images: ['assets/images/porsche-911.jpg'],
      passengerCapacity: '2',
      serviceRating: '5.0',
      status: Status.AVAILABLE
    },
    {
      carId: '12',
      brand: 'Hyundai',
      model: 'Tucson',
      year: '2022',
      category: 'SUV',
      gearBoxType: GearBoxType.AUTOMATIC,
      engineType: 'Hybrid',
      engineCapacity: '1.6L',
      seats: '5',
      fuelConsumption: '7',
      pricePerDay: '170',
      carRating: '4.6',
      imageURL: 'assets/images/hyundai-tucson.jpg',
      location: 'Ukraine, Kharkiv',
      available: true,
      climateControlOption: ClimateControlOption.NONE,
      fuelType: FuelType.PETROL,
      images: [],
      passengerCapacity: '',
      serviceRating: '',
      status: Status.AVAILABLE
    },
    
  // First 12 cars are already correctly formatted...

  {
    carId: '13',
    brand: 'Mazda',
    model: 'CX-5',
    year: '2022',
    category: 'SUV',
    gearBoxType: GearBoxType.AUTOMATIC,
    engineType: 'Gasoline',
    engineCapacity: '2.5L',
    seats: '5',
    fuelConsumption: '8',
    pricePerDay: '190',
    carRating: '4.7',
    imageURL: 'assets/images/mazda-cx5.jpg',
    location: 'Ukraine, Dnipro',
    available: true,
    climateControlOption: ClimateControlOption.CLIMATE_CONTROL,
    fuelType: FuelType.PETROL,
    images: ['assets/images/mazda-cx5.jpg'],
    passengerCapacity: '5',
    serviceRating: '4.6',
    status: Status.AVAILABLE
  },
  {
    carId: '14',
    brand: 'Kia',
    model: 'Sportage',
    year: '2023',
    category: 'SUV',
    gearBoxType: GearBoxType.AUTOMATIC,
    engineType: 'Diesel',
    engineCapacity: '2.0L',
    seats: '5',
    fuelConsumption: '7',
    pricePerDay: '160',
    carRating: '4.5',
    imageURL: 'assets/images/kia-sportage.jpg',
    location: 'Ukraine, Kyiv',
    available: true,
    climateControlOption: ClimateControlOption.AIR_CONDITIONER,
    fuelType: FuelType.DIESEL,
    images: ['assets/images/kia-sportage.jpg'],
    passengerCapacity: '5',
    serviceRating: '4.5',
    status: Status.AVAILABLE
  },
  {
    carId: '15',
    brand: 'Chevrolet',
    model: 'Camaro',
    year: '2021',
    category: 'Sports',
    gearBoxType: GearBoxType.MANUAL,
    engineType: 'Gasoline',
    engineCapacity: '6.2L',
    seats: '4',
    fuelConsumption: '13',
    pricePerDay: '350',
    carRating: '4.8',
    imageURL: 'assets/images/chevrolet-camaro.jpg',
    location: 'Ukraine, Odesa',
    available: true,
    climateControlOption: ClimateControlOption.CLIMATE_CONTROL,
    fuelType: FuelType.PETROL,
    images: ['assets/images/chevrolet-camaro.jpg'],
    passengerCapacity: '4',
    serviceRating: '4.7',
    status: Status.AVAILABLE
  },
  {
    carId: '16',
    brand: 'Subaru',
    model: 'Outback',
    year: '2022',
    category: 'Wagon',
    gearBoxType: GearBoxType.AUTOMATIC,
    engineType: 'Gasoline',
    engineCapacity: '2.5L',
    seats: '5',
    fuelConsumption: '8',
    pricePerDay: '210',
    carRating: '4.6',
    imageURL: 'assets/images/subaro-outback.jpg',
    location: 'Ukraine, Lviv',
    available: true,
    climateControlOption: ClimateControlOption.CLIMATE_CONTROL,
    fuelType: FuelType.PETROL,
    images: ['assets/images/subaro-outback.jpg'],
    passengerCapacity: '5',
    serviceRating: '4.6',
    status: Status.AVAILABLE
  },
  {
    carId: '17',
    brand: 'Lexus',
    model: 'RX',
    year: '2023',
    category: 'SUV',
    gearBoxType: GearBoxType.AUTOMATIC,
    engineType: 'Hybrid',
    engineCapacity: '3.5L',
    seats: '5',
    fuelConsumption: '7',
    pricePerDay: '320',
    carRating: '4.8',
    imageURL: 'assets/images/lexus-rx.jpg',
    location: 'Ukraine, Kyiv',
    available: true,
    climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
    fuelType: FuelType.HYBRID,
    images: ['assets/images/lexus-rx.jpg'],
    passengerCapacity: '5',
    serviceRating: '4.8',
    status: Status.AVAILABLE
  },
  {
    carId: '18',
    brand: 'Volvo',
    model: 'XC60',
    year: '2022',
    category: 'SUV',
    gearBoxType: GearBoxType.AUTOMATIC,
    engineType: 'Diesel',
    engineCapacity: '2.0L',
    seats: '5',
    fuelConsumption: '6',
    pricePerDay: '290',
    carRating: '4.7',
    imageURL: 'assets/images/volvo-xc60.jpg',
    location: 'Ukraine, Kharkiv',
    available: true,
    climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
    fuelType: FuelType.DIESEL,
    images: ['assets/images/volvo-xc60.jpg'],
    passengerCapacity: '5',
    serviceRating: '4.7',
    status: Status.AVAILABLE
  },
  {
    carId: '19',
    brand: 'Mini',
    model: 'Cooper',
    year: '2021',
    category: 'Hatchback',
    gearBoxType: GearBoxType.MANUAL,
    engineType: 'Gasoline',
    engineCapacity: '1.5L',
    seats: '4',
    fuelConsumption: '6',
    pricePerDay: '150',
    carRating: '4.5',
    imageURL: 'assets/images/mini-cooper.jpg',
    location: 'Ukraine, Kyiv',
    available: true,
    climateControlOption: ClimateControlOption.AIR_CONDITIONER,
    fuelType: FuelType.PETROL,
    images: ['assets/images/mini-cooper.jpg'],
    passengerCapacity: '4',
    serviceRating: '4.5',
    status: Status.AVAILABLE
  },
  {
    carId: '20',
    brand: 'Audi',
    model: 'Q7',
    year: '2023',
    category: 'SUV',
    gearBoxType: GearBoxType.AUTOMATIC,
    engineType: 'Diesel',
    engineCapacity: '3.0L',
    seats: '7',
    fuelConsumption: '9',
    pricePerDay: '340',
    carRating: '4.9',
    imageURL: 'assets/images/audi-q7.jpg',
    location: 'Ukraine, Lviv',
    available: true,
    climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
    fuelType: FuelType.DIESEL,
    images: ['assets/images/audi-q7.jpg'],
    passengerCapacity: '7',
    serviceRating: '4.9',
    status: Status.AVAILABLE
  },
  {
    carId: '21',
    brand: 'Renault',
    model: 'Megane',
    year: '2022',
    category: 'Hatchback',
    gearBoxType: GearBoxType.MANUAL,
    engineType: 'Diesel',
    engineCapacity: '1.5L',
    seats: '5',
    fuelConsumption: '5',
    pricePerDay: '95',
    carRating: '4.4',
    imageURL: 'assets/images/renault-megane.jpg',
    location: 'Ukraine, Odesa',
    available: true,
    climateControlOption: ClimateControlOption.AIR_CONDITIONER,
    fuelType: FuelType.DIESEL,
    images: ['assets/images/renault-megane.jpg'],
    passengerCapacity: '5',
    serviceRating: '4.4',
    status: Status.AVAILABLE
  },
  {
    carId: '22',
    brand: 'Toyota',
    model: 'RAV4',
    year: '2023',
    category: 'SUV',
    gearBoxType: GearBoxType.AUTOMATIC,
    engineType: 'Hybrid',
    engineCapacity: '2.5L',
    seats: '5',
    fuelConsumption: '5',
    pricePerDay: '230',
    carRating: '4.8',
    imageURL: 'assets/images/toyota-rav4.jpg',
    location: 'Ukraine, Dnipro',
    available: true,
    climateControlOption: ClimateControlOption.TWO_ZONE_CLIMATE_CONTROL,
    fuelType: FuelType.HYBRID,
    images: ['assets/images/toyota-rav4.jpg'],
    passengerCapacity: '5',
    serviceRating: '4.8',
    status: Status.AVAILABLE
  }

    
  ];

  // Default price range
  readonly defaultMinPrice: number = 50;
  readonly defaultMaxPrice: number = 700;

  constructor() {
    // Initialize with all cars
    this.filteredCarsSubject.next(this.mockCars);
  }

  // Get all cars
  getAllCars(): Car[] {
    return this.mockCars;
  }

  // Get available locations from the cars
  getLocations(): string[] {
    const locations = new Set<string>();
    this.mockCars.forEach(car => locations.add(car.location));
    return Array.from(locations);
  }

  // Get available car categories from the cars
  getCarCategories(): string[] {
    const categories = new Set<string>();
    this.mockCars.forEach(car => categories.add(car.category));
    return Array.from(categories);
  }

  // Get available gearbox types from the cars
  getGearboxTypes(): string[] {
    const types = new Set<string>();
    this.mockCars.forEach(car => types.add(car.gearBoxType));
    return Array.from(types);
  }

  // Get available engine types from the cars
  getEngineTypes(): string[] {
    const types = new Set<string>();
    this.mockCars.forEach(car => types.add(car.engineType));
    return Array.from(types);
  }

  // Filter cars based on criteria
  filterCars(filters: FilterCriteria): Car[] {
    console.log('Applying filters:', filters);

    // Start with all cars
    let result = [...this.mockCars];

    // Apply location filter
    if (filters.pickupLocation && filters.pickupLocation.trim() !== '') {
      result = result.filter(car => car.location.includes(filters.pickupLocation));
    }

    // Apply category filter
    if (filters.carCategory && filters.carCategory.trim() !== '') {
      console.log('Filtering by category:', filters.carCategory);
      result = result.filter(car => car.category === filters.carCategory);
    }

    // Apply gearbox filter
    if (filters.gearboxType && filters.gearboxType.trim() !== '') {
      console.log('Filtering by gearbox:', filters.gearboxType);
      result = result.filter(car => car.gearBoxType === filters.gearboxType);
    }

    // Apply engine filter
    if (filters.engineType && filters.engineType.trim() !== '') {
      console.log('Filtering by engine:', filters.engineType);
      result = result.filter(car => car.engineType === filters.engineType);
    }

    // Apply price range filter
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      console.log('Filtering by price range:', filters.minPrice, '-', filters.maxPrice);
      result = result.filter(car =>
        parseFloat(car.pricePerDay) >= filters.minPrice && parseFloat(car.pricePerDay) <= filters.maxPrice
      );
    }

    console.log('Filtered results:', result.length);

    // Update the subject with filtered results
    this.filteredCarsSubject.next(result);

    return result;
  }

  // Reset filters and return all cars
  resetFilters(): Car[] {
    this.filteredCarsSubject.next(this.mockCars);
    return this.mockCars;
  }
}