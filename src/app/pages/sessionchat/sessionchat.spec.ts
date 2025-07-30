import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sessionchat } from './sessionchat';

describe('Sessionchat', () => {
  let component: Sessionchat;
  let fixture: ComponentFixture<Sessionchat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sessionchat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sessionchat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
