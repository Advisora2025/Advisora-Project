import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantPayment } from './consultant.payment';

describe('ConsultantPayment', () => {
  let component: ConsultantPayment;
  let fixture: ComponentFixture<ConsultantPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultantPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultantPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
