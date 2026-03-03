import { TestBed } from '@angular/core/testing';

import { ChoresService } from './chores.service';

describe('ChoresService', () => {
  let service: ChoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
