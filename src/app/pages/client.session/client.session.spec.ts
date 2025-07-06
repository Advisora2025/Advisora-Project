import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSession } from './client.session';

describe('ClientSession', () => {
  let component: ClientSession;
  let fixture: ComponentFixture<ClientSession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSession]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientSession);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
