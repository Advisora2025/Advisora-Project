import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantDetailsDialog } from './consultant-details-dialog';

describe('ConsultantDetailsDialog', () => {
  let component: ConsultantDetailsDialog;
  let fixture: ComponentFixture<ConsultantDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultantDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultantDetailsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
