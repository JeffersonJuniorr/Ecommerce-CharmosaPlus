import { TestBed } from '@angular/core/testing';

import { MOCK_DASHBOARD_DATA } from './mock-dashboard.service';

describe('MOCK_DASHBOARD_DATA', () => {
  let service: typeof MOCK_DASHBOARD_DATA;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = MOCK_DASHBOARD_DATA;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
