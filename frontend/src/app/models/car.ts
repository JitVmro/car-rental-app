export interface Car {
    carId: string
    carRating: string
    climateControlOption: ClimateControlOption
    engineCapacity: string
    fuelConsumption: string
    fuelType: FuelType
    gearBoxType: GearBoxType
    images: Array<string>
    location: string
    model: string
    passengerCapacity: string
    pricePerDay: string
    serviceRating: string
    status: Status
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