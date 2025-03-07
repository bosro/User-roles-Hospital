import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { DoctorService } from '../../services/doctor.service';
import { Doctor, TimeSlot } from '../../doctors.model';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    TimelineModule,
    ChartModule,
    TagModule,
    AvatarModule,
    CalendarModule
  ],
  templateUrl: 'doctor-profile.component.html'
})
export class DoctorProfileComponent implements OnInit {
  doctor: Doctor | null = null;
  availableSlots: TimeSlot[] = [];
  appointmentsChartData: any;
  demographicsChartData: any;
  chartOptions: any;
  pieChartOptions: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {
    this.initializeChartOptions();
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadDoctor(id);
    }
  }

  private loadDoctor(id: string) {
    this.doctorService.getDoctorById(id).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.loadSchedule(new Date());
      }
    });
  }

  private loadSchedule(date: Date) {
    if (this.doctor?._id) {
      this.doctorService.getDoctorSchedule(this.doctor._id, date).subscribe({
        next: (schedule) => {
          this.availableSlots = schedule.slots;
        }
      });
    }
  }

  onDateSelect(date: Date) {
    this.loadSchedule(date);
  }

  editProfile() {
    this.router.navigate(['../edit', this.doctor?._id], { relativeTo: this.route });
  }

  viewSchedule() {
    this.router.navigate(['../schedule'], { 
      relativeTo: this.route,
      queryParams: { doctorId: this.doctor?._id }
    });
  }

  getStatusSeverity(status: string | undefined): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    const severities: Record<string, "success" | "info" | "warn" | "danger"> = {
      'active': 'success',
      'inactive': 'danger',
      'on-leave': 'warn'
    };
    return severities[status || ''] || 'info';
  }

  getSlotStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    const severities: Record<string, "success" | "info" | "warn" | "danger"> = {
      'available': 'success',
      'booked': 'warn',
      'blocked': 'danger'
    };
    return severities[status] || 'info';
  }

  formatAddress(address?: any): string {
    if (!address) return '';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  }

  formatWorkingDays(days?: string[]): string {
    if (!days) return '';
    return days.map(day => 
      day.charAt(0).toUpperCase() + day.slice(1)
    ).join(', ');
  }

  private initializeChartOptions() {
    // Initialize chart options and data
  }
}