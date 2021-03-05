import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import using from 'jasmine-data-provider';
import { ReferenceService } from 'src/app/services/integrations/reference.service';
import { SystemService } from 'src/app/services/integrations/system.service';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { expRefSys1, expRefSys2, projectId, refTypes, system1, system2 } from 'src/app/testing-support/integrations-data.spec';
import { ReferenceServiceMock } from 'src/app/testing-support/mocks/reference-service-mock.spec';
import { SystemServiceMock } from 'src/app/testing-support/mocks/system-service-mock.spec';
import { IntSystemSelectComponent } from './int-system-select/int-system-select.component';
import { ReferencesComponent } from './references.component';

describe('ReferencesComponent', () => {
  let component: ReferencesComponent;
  let fixture: ComponentFixture<ReferencesComponent>;
  let refService: ReferenceServiceMock;
  let systemService: SystemServiceMock;
  let domComponent: DOMComponent;

  beforeEach(async(() => {
    refService = new ReferenceServiceMock();
    systemService = new SystemServiceMock();
    TestBed.configureTestingModule({
      declarations: [ReferencesComponent, IntSystemSelectComponent],
      providers: [
        { provide: SystemService, useValue: systemService.mock() },
        { provide: ReferenceService, useValue: refService.mock() }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferencesComponent);
    component = fixture.componentInstance;
    domComponent = new DOMComponent(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show "add reference" form when there are no systems', () => {
    systemService.getAll([]);
    refService.get([]);

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.systems.length).toBe(0);

    domComponent.shouldNotShowAddRefForm();
  });

  it('should not show list of references table when there are no references', () => {
    systemService.getAll([]);
    refService.get([]);

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.references.length).toBe(0);

    domComponent.shouldNotShowListOfRefsTable();
  });

  it('should display list of references', () => {
    let expRefs: Reference[] = [expRefSys1, expRefSys2];
    systemService.getAll([system1, system2]);
    refService.get(expRefs);

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.references.length).toBe(expRefs.length);

    domComponent.shouldShowReferences(expRefs);
  });

  using([refTypes[0]], refType => {
    it(`should add new ${refType.name} reference`, () => {
      systemService.getAll([system1, system2]);

      refService
        .get([])
        .create(expRefSys1)
        .getRefSystemName(system1.name);

      expect(component.references.length).toBe(0);

      component.ngOnInit();
      expect(component.references.length).toBe(0);

      component.referenceType = refType;
      component.projectId = projectId;
      component.entityId = 2;
      component.addLinkForm.controls.refKey.setValue(expRefSys1.key);
      component.selectedSystem = system1;
      component.onReferencesChanged.subscribe(refs => {
        expect(refs.length).toBe(1);
      }, fail);
      component.addReference();
      fixture.detectChanges();
      expect(component.references.length).toBe(1);

      domComponent.shouldShowReferences([expRefSys1]);
    });
  });

  it('should delete reference', () => {
    systemService.getAll([system1]);
    refService
      .get([expRefSys1])
      .delete();

    component.ngOnInit();
    fixture.detectChanges();

    domComponent.shouldShowDeleteBtn(expRefSys1);

    component.deleteReference(expRefSys1);
    fixture.detectChanges();

    domComponent.shouldNotShowListOfRefsTable();
  });

  it('should open reference in new window', () => {
    //TODO: is it possible to check new window opening? 
  });
});

class DOMComponent {
  addRefForm: string = '#add-ref-form';
  refKeyInput: string = '#ref-key';
  addRefBtn: string = "#add-ref";
  refsListTable: string = '#refs-list-table';
  refitem: string = '#ref-item-key';
  deleteRefItem: string = '#delete-ref-item';

  private element: HTMLElement;

  constructor(private fixture: ComponentFixture<ReferencesComponent>) {
    this.element = fixture.debugElement.nativeElement;
  }

  shouldNotShowAddRefForm() {
    expect(this.element.querySelectorAll(this.addRefForm).length).toBe(0);
  }

  shouldNotShowListOfRefsTable() {
    expect(this.element.querySelectorAll(this.refsListTable).length).toBe(0);
  }

  shouldShowReferences(expRefs: Reference[]) {
    let refs: NodeListOf<HTMLElement> = this.element.querySelectorAll(this.refitem);
    expect(refs.length).toBe(expRefs.length);
    expRefs.forEach((expRef, index) => {
      expect(refs[index].textContent).toEqual(expRef.key);
    });
  }

  shouldShowDeleteBtn(ref: Reference) {
    expect(this.element.querySelector(`#${ref.key}`).querySelectorAll(this.deleteRefItem).length).toBe(1);
  }
}
