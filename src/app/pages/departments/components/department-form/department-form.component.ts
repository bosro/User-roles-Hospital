import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
// import { InputTextareaModule } from 'primeng/inputtextarea';
// import { ChipsModule } from 'primeng/chips';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { MultiSelectModule } from 'primeng/multiselect';

import { Department } from '../../department.model';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    // InputTextareaModule,
    // ChipsModule,
    CalendarModule,
    ToastModule,
    DividerModule,
    ChipModule,
    MultiSelectModule
  ],
  templateUrl: './department-form.component.html'
})
export class DepartmentFormComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode = false;
  departmentId: string = '';
  loading = false;
  submitting = false;
  formErrors: any = {};

  workingDays = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' }
  ];

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.departmentId = this.route.snapshot.params['id'];
    if (this.departmentId) {
      this.isEditMode = true;
      this.loadDepartment();
    }
  }


  this.doctorService.getDoctors().subscribe({
    next: (doctors) => {
      this.doctors = doctors.map(doctor => ({
        label: `${doctor.firstName} ${doctor.lastName}`,
        value: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        id: doctor.id,
        department: doctor.department
      }));
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load doctors: ' + (error.message || 'Unknown error')
      });
    }
  });



  private initForm() {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[A-Z0-9]+$/)]],
      description: ['', [Validators.maxLength(500)]],
      headOfDepartment: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: [''],
      facilities: [[]],
      specialties: [[]],
      
      location: this.fb.group({
        building: [''],
        floor: [null],
        roomNumbers: [[]]
      }),
      
      capacity: this.fb.group({
        totalBeds: [0, [Validators.required, Validators.min(0)]],
        currentOccupancy: [0, [Validators.required, Validators.min(0)]],
        staffCount: [0, [Validators.required, Validators.min(0)]]
      }),
      
      schedule: this.fb.group({
        workingDays: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']],
        startTime: [new Date('2023-01-01T08:00:00')],
        endTime: [new Date('2023-01-01T17:00:00')]
      }),
      
      contactInfo: this.fb.group({
        email: ['', [Validators.email]],
        phone: [''],
        emergencyContact: ['']
      })
    }, { validators: [this.validateOccupancy] });

    // Monitor changes to show live validation
    this.departmentForm.valueChanges.subscribe(() => {
      this.formErrors = this.getFormValidationErrors();
    });
  }

  validateOccupancy(group: FormGroup) {
    const totalBeds = group.get('capacity.totalBeds')?.value;
    const currentOccupancy = group.get('capacity.currentOccupancy')?.value;

    if (totalBeds != null && currentOccupancy != null && currentOccupancy > totalBeds) {
      return { occupancyExceedsBeds: true };
    }
    return null;
  }

  private loadDepartment() {
    this.loading = true;
    this.departmentService.getDepartmentById(this.departmentId).subscribe({
      next: (department) => {
        // Format the times correctly for the calendar component
        const startTime = department.schedule?.startTime 
          ? new Date(`2023-01-01T${department.schedule.startTime}`) 
          : new Date('2023-01-01T08:00:00');
        
        const endTime = department.schedule?.endTime 
          ? new Date(`2023-01-01T${department.schedule.endTime}`) 
          : new Date('2023-01-01T17:00:00');

        // Update the form with the department data
        this.departmentForm.patchValue({
          name: department.name,
          code: department.code,
          description: department.description,
          headOfDepartment: department.headOfDepartment,
          email: department.email,
          phone: department.phone,
          facilities: department.facilities,
          specialties: department.specialties,
          
          location: {
            building: department.location?.building,
            floor: department.location?.floor,
            roomNumbers: department.location?.roomNumbers
          },
          
          capacity: {
            totalBeds: department.capacity?.totalBeds,
            currentOccupancy: department.capacity?.currentOccupancy,
            staffCount: department.capacity?.staffCount
          },
          
          schedule: {
            workingDays: department.schedule?.workingDays,
            startTime: startTime,
            endTime: endTime
          },
          
          contactInfo: {
            email: department.contactInfo?.email,
            phone: department.contactInfo?.phone,
            emergencyContact: department.contactInfo?.emergencyContact
          }
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading department:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load department details',
          life: 5000
        });
        this.loading = false;
        this.router.navigate(['/departments']);
      }
    });
  }

  getFormValidationErrors() {
    let errors: any = {};
    Object.keys(this.departmentForm.controls).forEach(key => {
      const control = this.departmentForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
      
      // Check for nested form groups
      if (control instanceof FormGroup) {
        const nestedErrors = this.getNestedFormValidationErrors(control, key);
        if (Object.keys(nestedErrors).length > 0) {
          errors = { ...errors, ...nestedErrors };
        }
      }
    });
    return errors;
  }

  getNestedFormValidationErrors(formGroup: FormGroup, parentKey: string) {
    let errors: any = {};
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.errors) {
        errors[`${parentKey}.${key}`] = control.errors;
      }
    });
    return errors;
  }

  onSubmit() {
    if (this.departmentForm.invalid) {
      this.markFormGroupTouched(this.departmentForm);
      
      // Check if occupancy exceeds beds
      if (this.departmentForm.hasError('occupancyExceedsBeds')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Current occupancy cannot exceed total beds',
          life: 5000
        });
        return;
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly',
        life: 5000
      });
      return;
    }

    // Format the data before submission
    const formData = this.departmentForm.value;
    
    // Format time values
    if (formData.schedule?.startTime instanceof Date) {
      formData.schedule.startTime = this.formatTime(formData.schedule.startTime);
    }
    
    if (formData.schedule?.endTime instanceof Date) {
      formData.schedule.endTime = this.formatTime(formData.schedule.endTime);
    }

    this.submitting = true;

    if (this.isEditMode) {
      this.departmentService.updateDepartment(this.departmentId, formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Department updated successfully',
            life: 3000
          });
          setTimeout(() => this.router.navigate(['/departments']), 1500);
        },
        error: (err) => {
          console.error('Error updating department:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update department: ' + (err.message || 'Unknown error'),
            life: 5000
          });
          this.submitting = false;
        }
      });
    } else {
      this.departmentService.createDepartment(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Department created successfully',
            life: 3000
          });
          setTimeout(() => this.router.navigate(['/departments']), 1500);
        },
        error: (err) => {
          console.error('Error creating department:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create department: ' + (err.message || 'Unknown error'),
            life: 5000
          });
          this.submitting = false;
        }
      });
    }
  }

  formatTime(date: Date): string {
    if (!date) return '';
    return date.toTimeString().substring(0, 5); // Get HH:MM format
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.departmentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isNestedFieldInvalid(parent: string, field: string): boolean {
    const control = this.departmentForm.get(`${parent}.${field}`);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goBack() {
    this.router.navigate(['/departments']);
  }
}