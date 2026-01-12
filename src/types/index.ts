
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

export interface Ticket {
  id: string;
  ticketNumber: string;
  type: TicketType;
  resourceName: string;
  weightIn: number;
  weightOut: number;
  netWeight: number;
  unitPrice: number;
  totalPrice: number;
  status: TicketStatus;
  createdAt: string;
  createdBy: string;
}
