import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../models/appointment.model';

type Priority = 'high' | 'medium' | 'low';
type AppointmentType = 'regular' | 'follow-up' | 'emergency' | 'consultation' | 'procedure';
type WaitingListStatus = 'waiting' | 'scheduled' | 'cancelled';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface Patient {
  id: string;
  name: string;
}

interface WaitingListItem {
  id: string;
  patientId: string;
  patientName: string;
  type: AppointmentType;
  priority: Priority;
  status: WaitingListStatus;
  requestedDate: string;
  notes?: string;
}

interface DropdownOption {
  label: string;
  value: string;
}


@Component({
  selector: 'app-waiting-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: 'waiting-list.component.html',
})
export class WaitingListComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  @ViewChild('waitingForm') waitingForm!: NgForm;

  waitingList: WaitingListItem[] = [];
  loading = false;
  displayAddDialog = false;

  // Form fields
  selectedPatient: Patient | null = null;
  selectedType: AppointmentType | '' = '';
  selectedPriority: Priority | '' = '';
  notes: string = '';

  patients: Patient[] = [];
  appointmentTypes: DropdownOption[] = [
    { label: 'Regular', value: 'regular' },
    { label: 'Follow-up', value: 'follow-up' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Consultation', value: 'consultation' },
    { label: 'Procedure', value: 'procedure' },
  ];

  priorities: DropdownOption[] = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  private readonly prioritySeverityMap: Record<Priority, TagSeverity> = {
    high: 'danger',
    medium: 'warn',
    low: 'info',
  };

  private readonly statusClassMap: Record<WaitingListStatus, string> = {
    waiting: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
    scheduled: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
    cancelled: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium',
  };


  constructor(
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadWaitingList();
  }

  private loadWaitingList() {
    this.loading = true;
    // Implement waiting list loading logic
    this.loading = false;
  }

  
  getPrioritySeverity(priority: Priority): TagSeverity {
    return this.prioritySeverityMap[priority] || 'info';
  }

  calculateWaitingTime(requestedDate: string): string {
    const start = new Date(requestedDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  }

  getStatusClass(status: WaitingListStatus): string {
    return this.statusClassMap[status] || this.statusClassMap.waiting;
  }

  onSearch(event: Event) {
    const element = event.target as HTMLInputElement;
    this.table.filterGlobal(element.value, 'contains');
  }


  showAddDialog() {
    this.displayAddDialog = true;
  }

  hideAddDialog() {
    this.displayAddDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.selectedPatient = null;
    this.selectedType = '';
    this.selectedPriority = '';
    this.notes = '';
  }

  addToWaitingList() {
    if (!this.selectedPatient || !this.selectedType || !this.selectedPriority) {
      return;
    }

    const newItem: WaitingListItem = {
      id: crypto.randomUUID(),
      patientId: this.selectedPatient.id,
      patientName: this.selectedPatient.name,
      type: this.selectedType,
      priority: this.selectedPriority,
      status: 'waiting',
      requestedDate: new Date().toISOString(),
      notes: this.notes
    };

    // Implement add to waiting list logic
    this.hideAddDialog();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Patient added to waiting list',
    });
    this.loadWaitingList();
  }

  scheduleAppointment(patient: WaitingListItem) {
    this.router.navigate(['/appointments/add'], {
      queryParams: {
        patientId: patient.patientId,
        type: patient.type,
        waitingListId: patient.id,
      },
    });
  }

  confirmRemove(patient: WaitingListItem) {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${patient.patientName} from the waiting list?`,
      accept: () => {
        // Implement remove from waiting list logic
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Patient removed from waiting list',
        });
        this.loadWaitingList();
      },
    });
  }
}
