import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SystemService } from 'src/app/services/integrations/system.service';
import { System } from 'src/app/shared/models/integrations/system';

import { IntSystemSelectComponent } from './int-system-select.component';

describe('IntSystemSelectComponent', () => {
  let component: IntSystemSelectComponent;
  let fixture: ComponentFixture<IntSystemSelectComponent>;

  const projectId = 1;
  const system1: System = {
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

  const system2: System = {
    id: 2,
    name: 'test system 2',
    url: 'http://aquality2',
    username: 'username2',
    password: 'pass2',
    int_system_type: 2,
    int_tts_type: 2,
    project_id: projectId,
    api_token: 'token2'
  };

  const systems: System[] = [system1, system2];

  //TODO: why do we have here simple async instead of 'waitForAsync' as in the example?
  // https://angular.io/guide/testing-components-basics#cli-generated-tests
  beforeEach(async(() => {
    let systemServiceSpy = jasmine.createSpyObj('SystemService', ['getAll']);
    systemServiceSpy.getAll.and.returnValue(of(systems));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [IntSystemSelectComponent],
      providers: [
        { provide: SystemService, useValue: systemServiceSpy }

      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntSystemSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have fiels initialized after construction', () => {
    //TODO: won't it be better to split? but this case we will have more bolierplate code
    expect(component.systems.length).toBe(0);
    expect(component.selectedSystem).toBeUndefined();
  });

  it('should have systems after Angular calls ngOnInit', () => {
    component.ngOnInit();
    expect(component.systems.length).toBe(2);
    expect(component.selectedSystem).toEqual(system1);
    component.onSystemSelected.subscribe(selected => {
      expect(selected).toEqual(system1);
    });
  });

  it('should emit selected value after selection', () => {
    component.ngOnInit();
    expect(component.selectedSystem).toEqual(system1);
    component.onSystemSelected.subscribe(selected => {
      expect(selected).toEqual(system2);
    });
    component.onSelect(system2);
    expect(component.selectedSystem).toEqual(system2);
  });

  it('option should contain system name', () => {
    //TODO: how deep should we check DOM? should we check attributes? (selected/not selected)
    component.ngOnInit();
    let element: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();
    expect(element.querySelector("option:nth-child(1)").textContent.trim()).toEqual(system1.name);
  });
});
