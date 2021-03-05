import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemService } from 'src/app/services/integrations/system.service';
import { system1, system2 } from 'src/app/testing-support/integrations-data.spec';
import { SystemServiceMock } from 'src/app/testing-support/mocks/system-service-mock.spec';
import { IntSystemSelectComponent } from './int-system-select.component';

describe('IntSystemSelectComponent', () => {
  let component: IntSystemSelectComponent;
  let fixture: ComponentFixture<IntSystemSelectComponent>;

  beforeEach(async(() => {
    let mockSystemService: SystemServiceMock = new SystemServiceMock();
    mockSystemService.getAll([system1, system2]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [IntSystemSelectComponent],
      providers: [
        { provide: SystemService, useValue: mockSystemService.mock() }

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
    component.ngOnInit();
    let element: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();
    expect(element.querySelector("option:nth-child(1)").textContent.trim()).toEqual(system1.name);
  });
});
