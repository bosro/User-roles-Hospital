import { ReportFilters } from "./reports.model";

export interface ReportTemplate {
    id?: string;
    name: string;
    description?: string;
    type: 'financial' | 'patient' | 'department' | 'inventory' | 'custom';
    filters: ReportFilters;
    sections: ReportSection[];
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      recipients: string[];
      active: boolean;
    };
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export interface ReportSection {
    id: string;
    type: 'chart' | 'table' | 'metrics' | 'summary';
    title: string;
    config: {
      chartType?: 'line' | 'bar' | 'pie' | 'doughnut';
      metrics?: string[];
      columns?: { field: string; header: string }[];
      groupBy?: string;
      sortBy?: string;
      limit?: number;
    };
    order: number;
  }
  


  