import { User } from "./User";

export enum BookingState {
  FinishedService = 'FinishedService',
  Cancelled = 'Cancelled',
  InProgress = 'InProgress',
  FinishedBooking = 'FinishedBooking',
  Reserved = 'Reserved',
}

export interface Booking {
  id: string;
  user: User;
  carimg: string;
  carname: string;
  state: BookingState;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  pickuplocation: Location;
  droplocation: Location;
}

export interface createBooking {
  "carId": string,
  "clientId": string,
  "dropOffDateTime": string,
  "dropOffLocationId": string,
  "pickupDateTime": string,
  "pickupLocationId": string
}

export enum Location{
  Kyiv = 'Ukraine, Kyiv',
  Lviv = 'Ukraine, Lviv',
  Odesa = 'Ukraine, Odesa',
  Kharkiv = 'Ukraine, Kharkiv',
  Dnipro = 'Ukraine, Dnipro',
}