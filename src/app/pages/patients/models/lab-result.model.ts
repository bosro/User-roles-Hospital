export interface LabReport {
    id: string;
    patientId: string;
    reportDate: string;
    reportNumber: string;
    orderedBy: string;
    category: string;
    status: 'completed' | 'pending' | 'cancelled';
    tests: LabResult[];
    notes?: string;
    attachments?: string[];
  }
  
  export interface LabResult {
    id: string;
    testName: string;
    category: string;
    result: string | number;
    unit: string;
    referenceRange: {
      min: number;
      max: number;
    };
    status: 'normal' | 'abnormal' | 'critical';
    testDate: string;
    notes?: string;
  }
  
  export interface LabResultsParams {
    timeRange?: 'all' | '6months' | '1year';
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }