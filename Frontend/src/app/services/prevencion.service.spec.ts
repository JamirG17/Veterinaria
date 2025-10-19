import { TestBed } from '@angular/core/testing';

import { PrevencionService } from './prevencion.service';

describe('PrevencionService', () => {
  let service: PrevencionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrevencionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
