import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SystemService } from 'src/app/services/integrations/system.service';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { ReferenceService } from 'src/app/services/integrations/reference.service';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { System } from 'src/app/shared/models/integrations/system';
import { ReferenceType } from 'src/app/shared/models/integrations/reference-type';

@Component({
  selector: 'app-reference',
  templateUrl: './references.component.html',
  styleUrls: ['./references.component.scss']
})
export class ReferencesComponent implements OnInit {

  addLinkForm: FormGroup;
  keyValidator = Validators.minLength(2);
  selectedSystem: System;
  systems: System[] = [];
  references: Reference[] = [];

  @Input() referenceType: ReferenceType;
  @Input() projectId: number;
  @Input() entityId: number;
  @Input() isAddBtnShown: boolean = true;
  @Input() isAddEnabled: boolean = true;
  @Output() onReferencesChanged = new EventEmitter<Reference[]>();

  constructor(
    private systemService: SystemService,
    private referenceService: ReferenceService
  ) { }

  ngOnInit(): void {

    this.addLinkForm = new FormGroup({
      refKey: new FormControl('', this.keyValidator)
    });

    this.systemService.getAll(this.projectId).subscribe(systems => {
      this.systems = systems;
    })

    this.referenceService.get(this.projectId, this.entityId, this.referenceType)
      .subscribe(references => {
        this.references = references;
        this.onReferencesChanged.emit(this.references);
      });
  }

  public getSystemName(reference: Reference): string {
    return this.referenceService.getRefSystemName(this.systems, reference);
  }

  public deleteReference(ref: Reference) {
    this.referenceService.delete(this.projectId, ref.id, this.referenceType)
      .subscribe(() => {
        this.references = this.references.filter(reference => (reference.id !== ref.id));
        this.onReferencesChanged.emit(this.references);
      });
  }

  public addReference() {
    this.addReferenceTo(this.entityId);
  }

  public addReferenceTo(entityId: number) {
    let reference = new Reference();
    reference.key = this.getAddingKey();
    reference.entity_id = entityId;
    reference.int_system = this.selectedSystem.id;
    reference.project_id = this.projectId;

    this.referenceService.create(reference, this.referenceType)
      .subscribe(
        item => {
          this.references.push(item);
          this.onReferencesChanged.emit(this.references);
        },
        () => {
          this.referenceService.get(this.projectId, reference.entity_id, this.referenceType)
            .subscribe(references => {
              this.references = references;
            })
        });
  }

  public getAddingKey(): string {
    return this.addLinkForm.controls.refKey.value;
  }

  public isAddingKeyValid(): boolean{
    return this.getAddingKey().length >= this.keyValidator.length;
  }

  openReference(reference: Reference) {
    this.systemService.get(this.projectId, reference.int_system)
      .subscribe(systems => {
        let url = systems[0].url;
        if (url != undefined) {
          //TODO: move 'browse' into Jira config in the database
          window.open(`${url}/browse/${reference.key}`);
        }
      });
  }

  onSystemSelected(system: System) {
    this.selectedSystem = system;
  }

  onSystemsReceived(systems: System[]) {
    this.systems = systems;
  }
}
