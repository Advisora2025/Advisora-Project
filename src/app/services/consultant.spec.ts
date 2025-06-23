import { TestBed } from '@angular/core/testing';

import { Consultant } from './consultant';

describe('Consultant', () => {
  let service: Consultant;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Consultant);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
