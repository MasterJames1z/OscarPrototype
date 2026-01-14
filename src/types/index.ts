
export type CardStatus = 'active' | 'upcoming' | 'expired';

export interface PriceCard {
  PriceID: number;
  ProductID: number;
  ProductName?: string; // For display
  EffectiveDate: string; // date
  ToDate?: string;       // Calculated or added field
  UnitPrice: number;
  status?: CardStatus;
  createdAt?: string;
}

export interface Product {
  ProductID: number;
  ProductCode: string;
  ProductName: string;
  CurrentPrice: number;
}

export interface Vendor {
  VendorID: number;
  VendorCode: string;
  VendorName: string;
  VendorAddress?: string;
  Phone?: string;
}

export interface Vehicle {
  VehicleID: number;
  LicensePlate: string;
  Province?: string;
  VehicleTypeID?: number;
  StandardTareWeight?: number;
}

export interface ResourceOption {
  label: string;
  value: string;
}

export type TicketStatus = 'draft' | 'pending' | 'approved';
export type TicketType = 'auto' | 'manual';
export type PaymentType = 'cash' | 'po';

export interface Ticket {
  id: string;
  ticketNumber: string;
  type: TicketType;
  paymentType: PaymentType;
  resourceName: string; // Product name
  productCode?: string;
  sellerName: string;
  sellerCode?: string;
  licensePlate: string;
  vehicleType?: string;
  weightIn: number;
  weightOut: number;
  netWeight: number;
  entryDateTime?: string;
  exitDateTime?: string;
  impurity: number; // %
  moisture: number; // %
  deductedWeight: number;
  remainingWeight: number;
  unitPrice: number;
  totalPrice: number;
  poNumber?: string;
  status: TicketStatus;
  remarks?: string;
  ProductID?: number;
  VendorID?: number;
  VehicleID?: number;
  createdAt: string;
  createdBy: string;
}
