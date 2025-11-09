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