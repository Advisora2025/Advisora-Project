import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutConsultant } from './aboutconsultant';

describe('Aboutconsultant', () => {
  let component: AboutConsultant;
  let fixture: ComponentFixture<AboutConsultant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutConsultant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutConsultant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
