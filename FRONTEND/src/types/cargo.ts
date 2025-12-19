// for mappicker
export interface MapLocation {
  coords: Coordinate;
  address: string;
}


export interface Coordinate {
  lat: number;
  lon: number;
}

export interface AddressSuggestion {
    displayName: string;
    lat: number;
    lon: number;
}

export interface AddressData {
    address: string;
    isValid: boolean;
    coords?: Coordinate ;
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
  routeId: string | null;
  tripId: string | null;
  fromStation: Station;
  toStation: Station;
  price: string;
  status: string;
  receiveCode: string;
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
  cargoRequestId?: string;
}

export interface CreateCargoItemRequest {
  cargo: CargoItem[];
}

export interface CreateCargoItemResponse {
  ids: number[];
}

export interface RecipientData {
  firstname: string;
  secondname: string;
  thirdname: string;
  phone: string;
  email: string;
}



export interface CreateRecipientResponse {
  id: number;
}

export interface Recipient {
  id: number;
  firstname: string;
  secondname: string;
  thirdname: string;
  phone: string;
  email: string;
  createdAt?: string;
}

export interface CreateCargoRequestData {
  consignerId: number;
  recipientId: number;
  fromStation: Station;
  toStation: Station;
  deadline: string; // ISO 8601
  maxPrice: string; // decimal(10,2)
}

export interface CreateCargoRequestResponse {
  id: string; // uuid
  receiveCode: "string";
}

export interface CargoType {
  id: number;
  type: string;
  fragile: boolean;
}

export interface CargoTypesResponse {
  cargoTypes: CargoType[];
}

// for state machine
export interface RequestCreationState {
    step: 'initial' | 'recipient_created' | 'request_created' | 'complete';
    recipientId?: number;
    requestId?: string; // uuid
    createdCargoIds?: number[];
    errors: {
        recipient?: string;
        request?: string;
        cargo?: string;
    };
    formData: {
        recipient: RecipientData | null;
        request: CreateCargoRequestData | null;
        cargo: CargoItem[] | null;
    };
    receiveCode: string | null;
}

export interface PartialRequestData {
    recipientData: RecipientData;
    requestData: Omit<CreateCargoRequestData, 'recipientId'>;
    cargoItems: CargoItem[];
}