import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mybookings } from './mybookings';

describe('Mybookings', () => {
  let component: Mybookings;
  let fixture: ComponentFixture<Mybookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mybookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mybookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
