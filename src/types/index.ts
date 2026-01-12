
export type CardStatus = 'active' | 'upcoming' | 'expired';

export interface PriceCard {
  id: string;
  resourceName: string;
  startDate: string; // ISO format
  endDate: string;   // ISO format
  unitPrice: number;
  status: CardStatus;
  createdAt: string;
  createdBy: string;
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
  status: TicketStatus;
  remarks?: string;
  createdAt: string;
  createdBy: string;
}
