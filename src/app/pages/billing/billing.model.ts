export interface Invoice {
    id?: string;
    invoiceNumber: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    department: string;
    dateIssued: Date;
    dueDate: Date;
    status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paidAmount: number;
    balance: number;
    paymentTerms?: string;
    notes?: string;
    insuranceClaim?: {
      provider: string;
      policyNumber: string;
      status: 'pending' | 'approved' | 'rejected';
      coverageAmount: number;
    };
  }
  
  export interface InvoiceItem {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    type: 'consultation' | 'procedure' | 'medicine' | 'lab' | 'other';
    code?: string;
  }
  
  export interface Payment {
    id?: string;
    invoiceId: string;
    invoiceNumber: string;
    patientId: string;
    patientName: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'insurance';
    transactionId?: string;
    status: 'completed' | 'pending' | 'failed';
    notes?: string;
  }
  
  export interface InsuranceClaim {
    id?: string;
    invoiceId: string;
    patientId: string;
    patientName: string;
    provider: string;
    policyNumber: string;
    claimNumber: string;
    dateSubmitted: Date;
    status: 'pending' | 'approved' | 'rejected';
    amount: number;
    approvedAmount?: number;
    rejectionReason?: string;
    documents?: string[];
    notes?: string;
  }
  
  