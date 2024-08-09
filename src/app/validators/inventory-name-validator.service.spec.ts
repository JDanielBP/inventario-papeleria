import { TestBed } from '@angular/core/testing';

import { InventoryNameValidatorService } from './inventory-name-validator.service';

describe('InventoryNameValidatorService', () => {
  let service: InventoryNameValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryNameValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
