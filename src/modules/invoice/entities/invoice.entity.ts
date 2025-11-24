export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  taxRate: number;
}

export interface Buyer {
  name: string;
  ntn: string;
  address: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  posId: string;
  dateTime: string;
  buyer: Buyer;
  items: InvoiceItem[];
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'REGISTERED' | 'FAILED';
  fbrCorrelationId?: string;
  qrCode?: string;
  digitalSignature?: string;
  createdAt: Date;
}
