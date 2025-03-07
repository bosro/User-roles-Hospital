// billing.model.ts

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  contactInfo?: {
    phone: string;
    email: string;
    address: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    validTill: Date;
  };
  status?: string;
  gender?: string;
  dateOfBirth?: Date;
  bloodGroup?: string;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  department: string;
  email?: string;
  available?: boolean;
  status?: string;
}

export interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type?: 'consultation' | 'procedure' | 'medicine' | 'lab' | 'other';
  code?: string;
}

export interface InsuranceClaim {
  id?: string;
  invoiceId: string;
  provider: string;
  policyNumber: string;
  claimNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  coverageAmount: number;
  submissionDate: Date;
  responseDate?: Date;
  notes?: string;
}

export interface Invoice {
  id?: string;
  _id?: string;
  invoiceNumber: string;
  patient?: Patient;
  doctor?: Doctor;
  patientId?: string;  
  doctorId?: string;
  dateIssued: Date;
  dueDate: Date;
  issueDate?: Date;  // Alternative field name
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total?: number;
  totalAmount?: number;  // Alternative field name
  balance: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  notes?: string;
  insuranceClaim?: InsuranceClaim;
  category?: string;
}

export interface Payment {
  id?: string;
  _id?: string;
  invoiceId: string;
  invoiceNumber?: string;
  patientId?: string;
  patientName?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'card' | 'insurance' | 'bank_transfer';
  reference?: string;
  transactionId?: string;
  status?: 'completed' | 'pending' | 'failed';
  notes?: string;
}