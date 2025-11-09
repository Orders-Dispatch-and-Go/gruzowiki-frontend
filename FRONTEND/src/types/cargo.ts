// types/cargo.ts
export interface Coordinate {
  lat: number;
  lon: number;
}

export interface Station {
  address: string;
  coords: Coordinate;
}

export interface CargoRequest {
  id: string;
  consignerId: number;
  recipientId: number;
  createdAt: number;
  deadline: number;
  calculatedTripId: string | null;
  actualTripId: string | null;
  fromStation: Station;
  toStation: Station;
  maxPrice: string;
  status: string;
  recipientName?: string;
}

export interface CargoRequestWithRecipient extends CargoRequest {
  recipientName: string;
}

export interface CargoRequestResponse {
  cargoRequests: CargoRequest[];
}

export interface CargoRequestFilter {
  id?: string;
  consignerId?: number;
  recipientId?: number;
  status?: string;
  createdFrom?: string;
  createdTo?: string;
}


export interface CargoItem {
  length: number;
  height: number;
  width: number;
  weight: number;
  cargoType: number;
  description: string;
  worth: number;
  cargoRequestId?: number;
}

export interface Recipient {
  firstname: string;
  secondname: string;
  thirdname: string;
  phone: string;
  email: string;
}

export interface CreateCargoRequest {
  consignerId: number;
  recipientId: number;
  fromStation: Station;
  toStation: Station;
  deadline: string; // ISO 8601
  maxPrice: string; // decimal(10,2)
}

export interface CargoType {
  id: number;
  type: string;
  fragile: boolean;
}