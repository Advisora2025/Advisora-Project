import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clientdashboard } from './clientdashboard';

describe('Clientdashboard', () => {
  let component: Clientdashboard;
  let fixture: ComponentFixture<Clientdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clientdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
