import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Consultantdashboard } from './consultantdashboard';

describe('Consultantdashboard', () => {
  let component: Consultantdashboard;
  let fixture: ComponentFixture<Consultantdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Consultantdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Consultantdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
