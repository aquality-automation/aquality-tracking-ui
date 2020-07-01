/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { APIInterceptorService } from './api-interceptor.service';

describe('Service: AuthInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [APIInterceptorService]
    });
  });

  it('should ...', inject([APIInterceptorService], (service: APIInterceptorService) => {
    expect(service).toBeTruthy();
  }));
});
