export interface Train {
  id: number;
  name: string;
  train_number: string;
  class_type: string;
  from_station: string;
  to_station: string;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  price: number;
}

export interface ClassOption {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
} 