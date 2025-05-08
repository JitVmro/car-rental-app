import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { supportGuard } from './support.guard';

describe('supportGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => supportGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
