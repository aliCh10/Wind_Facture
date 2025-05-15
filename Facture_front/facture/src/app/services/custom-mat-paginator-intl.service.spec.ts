import { TestBed } from '@angular/core/testing';

import { CustomMatPaginatorIntlService } from './custom-mat-paginator-intl.service';

describe('CustomMatPaginatorIntlService', () => {
  let service: CustomMatPaginatorIntlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomMatPaginatorIntlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
