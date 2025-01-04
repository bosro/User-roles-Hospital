import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBookingComponent } from './patient-booking.component';

describe('PatientBookingComponent', () => {
  let component: PatientBookingComponent;
  let fixture: ComponentFixture<PatientBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
