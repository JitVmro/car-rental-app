export interface FilterCriteria {
    pickupLocationId: string;
    dropoffLocationId: string;
    pickupDateTime: string;
    dropoffDateTime: string;
    category: string;
    gearBoxType: string;
    fuelType: string;
    minPrice: number;
    maxPrice: number;
  }