import { TestBed, inject } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

describe('Service: Auth', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };
  let mockCookieService: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    mockCookieService = jasmine.createSpyObj('CookieService', ['check', 'delete']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: CookieService, useValue: mockCookieService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should return true if auth cookie exists', () => {
    mockCookieService.check.and.returnValue(true);
    expect(service.hasAuthCookie()).toBe(true);
  });

  it('should return false if auth cookie does not exist', () => {
    mockCookieService.check.and.returnValue(false);
    expect(service.hasAuthCookie()).toBe(false);
  });

  it('should call redirectToLogin', async () => {
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    
    await service.redirectToLogin();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/'], { queryParams: {} });
});

  it('should log out the user', () => {
    service.logOut();
    expect(localStorage.length).toBe(0);
    expect(mockCookieService.delete).toHaveBeenCalledWith('iio78', '/');
  });
});
