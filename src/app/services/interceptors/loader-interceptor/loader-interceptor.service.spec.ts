import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoaderInterceptorService } from './loader-interceptor.service';
import { GlobalDataService } from '../../globaldata.service';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

describe('Service: LoaderInterceptor', () => {
  let service: LoaderInterceptorService;
  let mockGlobalDataService: jasmine.SpyObj<GlobalDataService>;

  beforeEach(() => {
    mockGlobalDataService = jasmine.createSpyObj('GlobalDataService', ['setLoaderVisibility']);
    mockGlobalDataService.requestQuery = 0;

    TestBed.configureTestingModule({
      providers: [
        LoaderInterceptorService,
        { provide: GlobalDataService, useValue: mockGlobalDataService },
      ],
    });

    service = TestBed.inject(LoaderInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should turn on loader after 500ms if request takes long', fakeAsync(() => {
    const req = new HttpRequest('GET', '/test');
    const next: HttpHandler = {
      handle: () => new Observable<HttpEvent<any>>()
    };

    service.intercept(req, next).subscribe();

    tick(500);

    expect(mockGlobalDataService.setLoaderVisibility).toHaveBeenCalledWith(true);
  }));
});
