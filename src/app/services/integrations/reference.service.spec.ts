import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import using from 'jasmine-data-provider';
import { of } from 'rxjs/internal/observable/of';
import { expRefSys1, expRefSys2, projectId, refTypes, system1 } from 'src/app/testing-support/integrations-data.spec';
import { GlobalDataService } from '../globaldata.service';
import { errors, ReferenceService } from './reference.service';


describe('ReferenceService', () => {
  let service: ReferenceService;
  let httpClientSpy: HttpTestingController;
  let notificationServiceSpy: any;

  beforeEach(() => {

    // mocking dependencies
    notificationServiceSpy = jasmine.createSpyObj('NotificationsService', ['error']);
    notificationServiceSpy.error.and.returnValue({});

    let routerSpy: Router = jasmine.createSpyObj('Router', ['get']);
    let activateRouteSpy: ActivatedRoute = jasmine.createSpyObj('ActivatedRoute', ['get']);
    let globalDataSpy: GlobalDataService = jasmine.createSpyObj('GlobalDataService', ['get']);
    (globalDataSpy as any).currentProject$ = of({ id: projectId });


    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activateRouteSpy },
        { provide: NotificationsService, useValue: notificationServiceSpy },
        { provide: GlobalDataService, useValue: globalDataSpy },
        ReferenceService,
      ]
    });

    service = TestBed.inject(ReferenceService);
    httpClientSpy = TestBed.inject(HttpTestingController);
  });

  using(refTypes, (refType) => {
    it(`should return reference by ${refType.name} entity id`, () => {
      service.get(projectId, expRefSys1.entity_id, refType).subscribe(refs => {
        expect(refs.length).toBe(1);
        // as we mock this response, there is no more sence to check response itself
        // but if we need to be sure that http response has not been transformed we can add this verification
        expect(refs[0]).toEqual(expRefSys1);
      }, fail);

      const req = httpClientSpy.expectOne(`/integration/references/${refType.path}?project_id=${projectId}&entity_id=${expRefSys1.entity_id}`);
      expect(req.request.method).toBe("GET");
      req.flush([expRefSys1]);
    });
  });


  using(refTypes, (refType) => {
    it(`should return empty array for undefined ${refType.name} entity id`, done => {
      service.get(projectId, undefined, refType).subscribe(refs => {
        expect(refs.length).toBe(0);
        done();
      }, fail);
      httpClientSpy.expectNone(`/integration/references/${refType.path}?project_id=${expRefSys1.project_id}&entity_id=${expRefSys1.entity_id}`);
    });
  });

  using(refTypes, (refType) => {
    it(`should be possible to getAll ${refType.name} references`, () => {
      service.getAll(projectId, refType).subscribe(refs => {
        expect(refs.length).toBe(2);
      }, fail);

      const req = httpClientSpy.expectOne(`/integration/references/${refType.path}?project_id=${projectId}`);
      expect(req.request.method).toBe("GET");
      req.flush([expRefSys1, expRefSys1]);
    })
  });


  using(refTypes, (refType) => {
    it(`should be possible to delete ${refType.name} reference`, () => {
      service.delete(projectId, expRefSys1.id, refType).subscribe(() => { }, fail);
      const req = httpClientSpy.expectOne(`/integration/references/${refType.path}?project_id=${projectId}&id=${expRefSys1.id}`);
      expect(req.request.method).toBe("DELETE");
    })
  });

  using(refTypes, (refType) => {
    it(`should be possible to create ${refType.name} reference`, () => {
      service.create(expRefSys1, refType).subscribe(ref => {
        expect(ref).toEqual(expRefSys1);
      }, fail);
      const reqGet = httpClientSpy.expectOne(`/integration/references/${refType.path}?project_id=${projectId}&entity_id=${expRefSys1.entity_id}`);
      expect(reqGet.request.method).toBe("GET");
      reqGet.flush([]);

      const reqPost = httpClientSpy.expectOne(`/integration/references/${refType.path}`);
      expect(reqPost.request.method).toBe("POST");
      expect(reqPost.request.body).toBe(expRefSys1);
      reqPost.flush(expRefSys1);
    })
  });

  using(refTypes, (refType) => {
    it(`should be possible to create only single per system ${refType.name} reference`, () => {
      service.create(expRefSys1, refType).subscribe(fail, error => {
        error.subscribe(() => { }, message => {
          expect(message).toEqual(errors.alreadyExists);
        })
      });
      const req = httpClientSpy.expectOne(`/integration/references/${refType.path}?project_id=${projectId}&entity_id=${expRefSys1.entity_id}`);
      expect(req.request.method).toBe("GET");
      req.flush([expRefSys1]);
    })
  });

  using(refTypes, (refType) => {
    it(`should be possible to create ${refType.name} reference for different systems`, () => {

      service.create(expRefSys2, refType).subscribe(ref => {
        expect(ref).toEqual(expRefSys2);
      }, fail);

      const req = httpClientSpy.expectOne(`/integration/references/${refType.path}?project_id=${projectId}&entity_id=${expRefSys2.entity_id}`);
      expect(req.request.method).toBe("GET");
      req.flush([expRefSys1]);

      const reqPost = httpClientSpy.expectOne(`/integration/references/${refType.path}`);
      expect(reqPost.request.method).toBe("POST");
      expect(reqPost.request.body).toBe(expRefSys2);
      reqPost.flush(expRefSys2);
    })
  });


  it(`should be possible to get system name by reference`, () => {
    let name = service.getRefSystemName([system1], expRefSys1);
    expect(name).toEqual(system1.name);
  });
});
