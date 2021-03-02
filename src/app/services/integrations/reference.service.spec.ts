import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { of } from 'rxjs/internal/observable/of';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GlobalDataService } from '../globaldata.service';

import { errors, ReferenceService } from './reference.service';
import using from 'jasmine-data-provider';
import { ReferenceType } from 'src/app/shared/models/integrations/reference-type';
import { System } from 'src/app/shared/models/integrations/system';

describe('ReferenceService', () => {
  let service: ReferenceService;
  let httpClientSpy: HttpTestingController;
  let notificationServiceSpy: any;

  const projectId = 1;
  const system: System = {
    id: 1,
    name: 'test system',
    url: 'http://aquality',
    username: 'username',
    password: 'pass',
    int_system_type: 1,
    int_tts_type: 1,
    project_id: projectId,
    api_token: 'token'
  };

  const expRefSys1: Reference = {
    id: 1000,
    key: 'S1-000001',
    entity_id: 1,
    project_id: projectId,
    int_system: system.id
  };

  const expRefSys2: Reference = {
    id: 1000,
    key: 'S2-000001',
    entity_id: 2,
    project_id: projectId,
    int_system: 2
  };

  // we already have such array in the project, but to exclude using the same in prod and test
  // we decided to has another for testing
  const refTypes: ReferenceType[] = [
    new ReferenceType(1, 'test'),
    new ReferenceType(2, 'issue'),
    new ReferenceType(3, 'testrun')
  ];

  beforeEach(() => {

    system.id = 1;

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
    let name = service.getRefSystemName([system], expRefSys1);
    expect(name).toEqual(system.name);
  });
});
