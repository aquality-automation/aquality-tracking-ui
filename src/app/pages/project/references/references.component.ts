import { Component, Input, OnInit } from '@angular/core';
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
  systems: System[] = [];
  references: Reference[] = [];

  @Input() referenceType: ReferenceType;
  @Input() projectId: number;
  @Input() entityId: number;

  constructor(
    private systemService: SystemService,
    private referenceService: ReferenceService
  ) { }

  ngOnInit(): void {
    this.addLinkForm = new FormGroup({
      refKey: new FormControl('', Validators.minLength(2)),
      refSystem: new FormControl('')
    });

    this.systemService.getAll(this.projectId)
      .subscribe(systems => {
        this.systems = systems;
        this.addLinkForm.controls.refSystem.setValue(systems[0]);
      })

    this.referenceService.get(this.projectId, this.entityId, this.referenceType)
      .subscribe(references => {
        this.references = references;
      })
  }

  public getSystemName(reference: Reference): string {
    return this.systems.filter(system => system.id === reference.int_system)[0].name;
  }

  public deleteReference(ref: Reference) {
    this.referenceService.delete(this.projectId, ref.id, this.referenceType)
      .subscribe(() => {
        this.references = this.references.filter(reference => (reference.id !== ref.id));
      });
  }

  public addReference() {
    let reference = new Reference();
    reference.key = this.addLinkForm.controls.refKey.value;
    console.log(this.entityId);
    reference.entity_id = this.entityId;
    reference.int_system = this.addLinkForm.controls.refSystem.value.id;
    reference.project_id = this.projectId;
    this.referenceService.create(reference, this.referenceType)
      .subscribe(item => {
        this.references.push(item);
      });
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
}
