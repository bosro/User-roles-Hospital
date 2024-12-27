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
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      headOfDepartment: this.fb.group({
        id: ['', Validators.required],
        name: [''],
        email: [''],
        phone: ['']
      }),
      location: this.fb.group({
        building: ['', Validators.required],
        floor: ['', Validators.required],
        roomNumbers: [[]]
      }),
      capacity: this.fb.group({
        beds: [0, [Validators.required, Validators.min(0)]],
        currentOccupancy: [0],
        staffCount: [0]
      }),
      operatingHours: this.fb.group({
        start: [null, Validators.required],
        end: [null, Validators.required]
      }),
      workingDays: [[], Validators.required],
      facilities: [[]],
      specialties: [[]],
      contactInfo: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        emergencyContact: ['']
      })
    });
  }

  private loadDoctors() {
    // Load doctors for head of department selection
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
      }
    });
  }

  onHeadOfDepartmentChange(event: any) {
    const doctor = this.doctors.find(d => d.id === event.value);
    if (doctor) {
      this.departmentForm.patchValue({
        headOfDepartment: {
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone
        }
      })
    }
  }

  onSubmit() {
    if (this.departmentForm.invalid) return;

    this.loading = true;
    const departmentData = this.departmentForm.value;

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
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} department`
        });
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
