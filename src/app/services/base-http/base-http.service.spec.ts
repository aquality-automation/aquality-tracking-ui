/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BaseHttpService } from './base-http.service';

describe('Service: BaseHttp', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BaseHttpService]
    });
  });

  it('should ...', inject([BaseHttpService], (service: BaseHttpService) => {
    expect(service).toBeTruthy();
  }));
});
