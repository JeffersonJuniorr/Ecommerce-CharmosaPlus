import { TestBed } from '@angular/core/testing';

import { MOCK_EXTRACT_DATA } from './mock-extract.service';

describe('MOCK_EXTRACT_DATA', () => {
  let service: typeof MOCK_EXTRACT_DATA;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = MOCK_EXTRACT_DATA;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
