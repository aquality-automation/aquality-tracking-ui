import { TestBed } from '@angular/core/testing';
import { ErrorInterceptorService } from './error-interceptor.service'; // Adjust the path as necessary
import { NotificationsService } from 'angular2-notifications'; // Adjust the path as necessary
import { AuthService } from '../../auth/auth.service'; // Adjust the path as necessary
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

describe('Service: ErrorInterceptor', () => {
  let service: ErrorInterceptorService;
  let notificationsService: jasmine.SpyObj<NotificationsService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    notificationsService = jasmine.createSpyObj('NotificationsService', ['error']);
    authService = jasmine.createSpyObj('AuthService', ['logOut']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ErrorInterceptorService,
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuthService, useValue: authService },
      ],
    });

    service = TestBed.inject(ErrorInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log out user on 401 error', () => {
    const mockRequest = new HttpRequest('GET', '/test');
    const mockHandler = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    const mockError = new HttpErrorResponse({
      error: { message: 'Unauthorized access' },
      status: 401,
    });
    mockHandler.handle.and.returnValue(throwError(mockError));

    service.intercept(mockRequest, mockHandler).subscribe({
      error: () => {
        expect(authService.logOut).toHaveBeenCalled();
        expect(notificationsService.error).toHaveBeenCalledWith(
          'Ooops! 401 code',
          'Unauthorized access'
        );
      },
    });
  });

  it('should notify user on other errors', () => {
    const mockRequest = new HttpRequest('GET', '/test');
    const mockHandler = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    const mockError = new HttpErrorResponse({
      error: { message: 'Some error occurred' },
      status: 500,
    });
    mockHandler.handle.and.returnValue(throwError(mockError));

    service.intercept(mockRequest, mockHandler).subscribe({
      error: () => {
        expect(notificationsService.error).toHaveBeenCalledWith(
          'Ooops! 500 code',
          'Some error occurred'
        );
      },
    });
  });

  it('should modify error message for duplicate entry', () => {
    const mockRequest = new HttpRequest('GET', '/test');
    const mockHandler = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    const mockError = new HttpErrorResponse({
      error: { message: "Duplicate entry 'test' for key 'PRIMARY'" },
      status: 400,
    });
    mockHandler.handle.and.returnValue(throwError(mockError));

    service.intercept(mockRequest, mockHandler).subscribe({
      error: () => {
        expect(notificationsService.error).toHaveBeenCalledWith(
          'Ooops! 400 code',
          "The 'test' value is duplicated by another entity!"
        );
      },
    });
  });
});
