
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
