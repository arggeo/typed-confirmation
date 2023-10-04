import { TestBed } from '@angular/core/testing';

import { TCService } from './typed-confirmation.service';

describe('TCService', () => {
  let service: TCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
