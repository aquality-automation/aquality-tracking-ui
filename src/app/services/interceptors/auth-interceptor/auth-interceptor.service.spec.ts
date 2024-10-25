import { TestBed, inject } from '@angular/core/testing';
import { AuthInterceptorService } from './auth-interceptor.service';
import { AuthService } from '../../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Service: AuthInterceptor', () => {
  let mockAuthService = {
    hasAuthCookie: jasmine.createSpy('hasAuthCookie').and.returnValue(true),
  };

  let mockCookieService = {
    get: jasmine.createSpy('get').and.returnValue('mockToken'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthInterceptorService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: CookieService, useValue: mockCookieService },
      ],
    });
  });

  it('should be created', inject([AuthInterceptorService], (service: AuthInterceptorService) => {
    expect(service).toBeTruthy();
  }));
});
