import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionFulfillmentComponent } from './prescription-fulfillment.component';

describe('PrescriptionFulfillmentComponent', () => {
  let component: PrescriptionFulfillmentComponent;
  let fixture: ComponentFixture<PrescriptionFulfillmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionFulfillmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescriptionFulfillmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
