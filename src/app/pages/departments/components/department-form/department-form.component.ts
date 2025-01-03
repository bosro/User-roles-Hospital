import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MessageService } from "primeng/api";
import { DepartmentService } from "../../services/department.service";
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { DropdownModule } from "primeng/dropdown";
import { MultiSelectModule } from "primeng/multiselect";
import { CalendarModule } from "primeng/calendar";
import { ToastModule } from "primeng/toast";

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    ToastModule,
    CommonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    ButtonModule,
    CardModule,
    ReactiveFormsModule
  ],
  templateUrl: 'department-form.component.html'
})

export class DepartmentFormComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode = false;
  loading = false;

  doctors: any[] = [];
  workingDays = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' },
    { label: 'Sunday', value: 'sunday' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadDoctors();
    this.checkEditMode();
  }

  private initializeForm() {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.pattern('^[A-Z0-9]+$')]],
      description: [''],
      headOfDepartment: this.fb.group({
        id: ['', Validators.required],
        name: [''],
        email: [''],
        phone: ['']
      }),
      location: this.fb.group({
        building: ['', Validators.required],
        floor: ['', [Validators.required, Validators.min(0)]],
        roomNumbers: [[]]
      }),
      capacity: this.fb.group({
        beds: [0, [Validators.required, Validators.min(1)]],
        currentOccupancy: [0, [Validators.min(0)]],
        staffCount: [0, [Validators.min(0)]]
      }),
      operatingHours: this.fb.group({
        start: [null, Validators.required],
        end: [null, Validators.required]
      }),
      workingDays: [[], [Validators.required, Validators.minLength(1)]],
      facilities: [[]],
      specialties: [[]],
      contactInfo: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9+-]+$')]],
        emergencyContact: ['', Validators.pattern('^[0-9+-]+$')]
      })
    }, { validators: this.validateOperatingHours });
  }

  private validateOperatingHours(group: FormGroup) {
    const start = group.get('operatingHours.start')?.value;
    const end = group.get('operatingHours.end')?.value;
    
    if (start && end) {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      
      if (startTime >= endTime) {
        return { invalidOperatingHours: true };
      }
    }
    return null;
  }

  private loadDoctors() {
    // Assuming you have a method to load doctors
    // this.doctorService.getDoctors().subscribe({
    //   next: (doctors) => {
    //     this.doctors = doctors.map(doctor => ({
    //       id: doctor.id,
    //       name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    //       email: doctor.email,
    //       phone: doctor.phone
    //     }));
    //   },
    //   error: () => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'Failed to load doctors'
    //     });
    //   }
    // });
  }

  private checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadDepartment(id);
    }
  }

  private loadDepartment(id: string) {
    this.loading = true;
    this.departmentService.getDepartmentById(id).subscribe({
      next: (department) => {
        this.departmentForm.patchValue(department);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load department'
        });
        this.loading = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  onHeadOfDepartmentChange(event: any) {
    const doctor = this.doctors.find(d => d.id === event.value);
    if (doctor) {
      const headOfDepartment = this.departmentForm.get('headOfDepartment');
      headOfDepartment?.patchValue({
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone
      });
    }
  }

  validateCapacity() {
    const capacity = this.departmentForm.get('capacity');
    const beds = capacity?.get('beds')?.value || 0;
    const currentOccupancy = capacity?.get('currentOccupancy')?.value || 0;

    if (currentOccupancy > beds) {
      capacity?.get('currentOccupancy')?.setErrors({ exceedsCapacity: true });
    }
  }

  onSubmit() {
    if (this.departmentForm.invalid) {
      Object.keys(this.departmentForm.controls).forEach(key => {
        const control = this.departmentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please check all required fields'
      });
      return;
    }

    this.loading = true;
    const departmentData = {
      ...this.departmentForm.value,
      operatingHours: {
        start: this.formatTime(this.departmentForm.value.operatingHours.start),
        end: this.formatTime(this.departmentForm.value.operatingHours.end)
      }
    };

    const operation = this.isEditMode
      ? this.departmentService.updateDepartment(this.route.snapshot.params['id'], departmentData)
      : this.departmentService.createDepartment(departmentData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Department ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} department: ${error.message}`
        });
        this.loading = false;
      }
    });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.departmentForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
