import { TestBed, inject } from '@angular/core/testing';
import { BaseHttpService } from './base-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalDataService } from '../globaldata.service';
import { NotificationsService } from 'angular2-notifications';
import { BehaviorSubject, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';

describe('Service: BaseHttp', () => {
  let mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  let mockActivatedRoute = {
    snapshot: { params: {} },
    params: of({}),
  };

  let mockGlobalDataService = {
    currentProject$: new BehaviorSubject<any>(null),
    getData: jasmine.createSpy('getData').and.returnValue({}),
  };

  let mockNotificationsService = {
    error: jasmine.createSpy('error'),
    warn: jasmine.createSpy('warn'),
    success: jasmine.createSpy('success'),
    info: jasmine.createSpy('info'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BaseHttpService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: GlobalDataService, useValue: mockGlobalDataService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ]
    });
  });

  it('should be created', inject([BaseHttpService], (service: BaseHttpService) => {
    expect(service).toBeTruthy();
  }));


  it('should call success notification', inject([BaseHttpService], (service: BaseHttpService) => {
    const successMessage = 'Test success message';
    const successTitle = 'Successful';

    service.handleSuccess(successMessage);

    expect(mockNotificationsService.success).toHaveBeenCalledWith(successTitle, successMessage);
  }));


  it('should call error notification', inject([BaseHttpService], (service: BaseHttpService) => {
    const errorHeader = 'Error Header';
    const errorMessage = 'Error message';

    service.handleSimpleError(errorHeader, errorMessage);

    expect(mockNotificationsService.error).toHaveBeenCalledWith(errorHeader, errorMessage);
  }));


  it('should call warning notification', inject([BaseHttpService], (service: BaseHttpService) => {
    const warningHeader = 'Warning Header';
    const warningMessage = 'Warning message';

    service.handleWarning(warningHeader, warningMessage);

    expect(mockNotificationsService.warn).toHaveBeenCalledWith(warningHeader, warningMessage);
  }));


  it('should call info notification', inject([BaseHttpService], (service: BaseHttpService) => {
    const infoMessage = 'Info message';
    const infoTitle = 'Information';

    service.handleInfo(infoMessage);

    expect(mockNotificationsService.info).toHaveBeenCalledWith(infoTitle, infoMessage);
  }));


  it('should unsubscribe from projectSubscription on destroy', inject([BaseHttpService], (service: BaseHttpService) => {
    spyOn(service['projectSubscription'], 'unsubscribe');

    service.ngOnDestroy();

    expect(service['projectSubscription'].unsubscribe).toHaveBeenCalled();
  }));


  it('should clean the object by removing null and undefined properties', inject([BaseHttpService], (service: BaseHttpService) => {
    const input = { a: 1, b: null, c: undefined, d: 'test' };

    const cleaned = service['clean'](input);

    expect(cleaned).toEqual({ a: 1, d: 'test' });
  }));


  it('should convert object to parameter object correctly', inject([BaseHttpService], (service: BaseHttpService) => {
    const input = { a: '1', b: null, c: undefined, d: 'test' };

    const params = service['convertToParams'](input) as { [param: string]: string | string[] };

    expect(params['a']).toBe('1');
    expect(params['d']).toBe('test');
    expect(params.hasOwnProperty('b')).toBeFalse();
    expect(params.hasOwnProperty('c')).toBeFalse();
  }));


  it('should return an empty object if input is null in convertToParams', inject([BaseHttpService], (service: BaseHttpService) => {
    const params = service['convertToParams'](null);

    expect(params).toEqual({});
  }));
});
