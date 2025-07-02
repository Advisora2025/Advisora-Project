import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantSidebar } from './consultant-sidebar';

describe('ConsultantSidebar', () => {
  let component: ConsultantSidebar;
  let fixture: ComponentFixture<ConsultantSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultantSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultantSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
