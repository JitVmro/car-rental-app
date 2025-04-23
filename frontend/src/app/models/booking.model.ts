import { User } from "./User";

export enum BookingState {
    FinishedService = 'FinishedService',
    Cancelled = 'Cancelled',
    InProgress = 'InProgress',
    FinishedBooking = 'FinishedBooking',
    Reserved = 'Reserved',
  }

export interface Booking {
    id: number;
    user:User;
    carimg:string;
    carname:string;
    state:BookingState
}