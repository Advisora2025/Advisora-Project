import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Consultentdashboard } from './consultentdashboard';

describe('Consultentdashboard', () => {
  let component: Consultentdashboard;
  let fixture: ComponentFixture<Consultentdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Consultentdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Consultentdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
