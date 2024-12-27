import { Observable } from "rxjs";

export interface ReportFilters {
    dateRange: {
      start: Date;
      end: Date;
    };
    department?: string;
    doctor?: string;
    reportType?: string;
    groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  }
  
  export interface ReportData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  }
  
  export interface FinancialMetrics {
    totalRevenue: number;
    expenses: number;
    profit: number;
    outstandingPayments: number;
    insuranceClaims: number;
    revenueByDepartment: { [key: string]: number };
    monthlyTrend: {
      month: string;
      revenue: number;
      expenses: number;
      profit: number;
    }[];
  }
  
 // reports.model.ts
export interface PatientMetrics {
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  averageWaitTime: number;
  averageVisitDuration: number;
  patientsByDepartment: Record<string, number>;
  patientDemographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
  };
  waitTimeByHour: {
    hour: number;
    averageWait: number;
    patientCount: number;
  }[];
}

export interface DepartmentMetrics {
  totalRevenue: number;
  totalPatients: number;
  averageVisitDuration: number;
  staffUtilization: number;
  revenueByService: Record<string, number>;
  performanceMetrics: {
    waitTime: number;
    patientSatisfaction: number;
    staffEfficiency: number;
  };
  hourlyStats: {
    hour: number;
    patients: number;
    revenue: number;
    staffLevel: number;
  }[];
}

export interface ReportService {
  getPatientMetrics(filters: ReportFilters): Observable<PatientMetrics>;
  getDepartmentMetrics(filters: ReportFilters): Observable<DepartmentMetrics>;
}
  


// export interface ReportTemplate {
//   id?: string;
//   name: string;
//   description?: string;
//   type: string;
//   filters: ReportFilters;
//   sections: ReportSection[];
//   schedule?: ReportSchedule;
//   createdBy: string;
//   createdAt: Date;
// }


export interface ReportSchedule {
  active: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: Date | null;
  recipients: string[];
}


export interface SectionConfig {
  chartType?: string;
  metrics?: string[];
  columns?: string[];
  sortBy?: string;
  limit?: number;
  groupBy?: string;
}

export interface SectionIcons {
  [key: string]: string;
  chart: string;
  table: string;
  metrics: string;
  summary: string;
}




export interface ReportSection {
  id?: string;
  type: 'chart' | 'table' | 'metrics' | 'summary';
  title: string;
  order: number;
  config: SectionConfig;
}


