import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Consultentprofile } from './consultentprofile';

describe('Consultentprofile', () => {
  let component: Consultentprofile;
  let fixture: ComponentFixture<Consultentprofile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Consultentprofile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Consultentprofile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
