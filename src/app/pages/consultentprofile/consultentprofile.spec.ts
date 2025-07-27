import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultentProfile } from './consultentprofile';

describe('ConsultentProfile', () => {
  let component: ConsultentProfile;
  let fixture: ComponentFixture<ConsultentProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultentProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultentProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
