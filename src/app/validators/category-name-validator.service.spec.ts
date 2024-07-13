import { TestBed } from '@angular/core/testing';

import { CategoryNameValidatorService } from './category-name-validator.service';

describe('CategoryNameValidatorService', () => {
  let service: CategoryNameValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryNameValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
