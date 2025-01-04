import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMonitoringComponent } from './patient-monitoring.component';

describe('PatientMonitoringComponent', () => {
  let component: PatientMonitoringComponent;
  let fixture: ComponentFixture<PatientMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
