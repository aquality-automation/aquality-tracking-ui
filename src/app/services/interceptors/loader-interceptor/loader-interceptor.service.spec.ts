/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LoaderInterceptorService } from './loader-interceptor.service';

describe('Service: LoaderInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoaderInterceptorService]
    });
  });

  it('should ...', inject([LoaderInterceptorService], (service: LoaderInterceptorService) => {
    expect(service).toBeTruthy();
  }));
});
