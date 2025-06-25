import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultentDashboard } from './consultentdashboard';

describe('Consultentdashboard', () => {
  let component: ConsultentDashboard;
  let fixture: ComponentFixture<ConsultentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultentDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultentDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
