import { Component, Input, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/integrations/system.service';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { TestReferenceService } from 'src/app/services/integrations/test-reference.service';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { System } from 'src/app/shared/models/integrations/system';

@Component({
  selector: 'app-linked-issues',
  templateUrl: './linked-issues.component.html',
  styleUrls: ['./linked-issues.component.scss']
})
export class LinkedIssuesComponent implements OnInit {

  addLinkForm: FormGroup;

  systems: System[] = [];
  references: Reference[] = [];

  //TODO: add project id and test id as inputs
  @Input() projectId: number;
  @Input() testId: number;

  constructor(
    private systemService: SystemService,
    private testReferenceService: TestReferenceService
  ) { }

  ngOnInit(): void {
    this.addLinkForm = new FormGroup({
      linkKey: new FormControl('', Validators.minLength(2)),
      linkSystem: new FormControl('')
    });

    this.systemService.getSystems(this.projectId)
      .subscribe(systems => {
        this.systems = systems;
        this.addLinkForm.controls.linkSystem.setValue(systems[0]);
      })

    this.testReferenceService.get(this.projectId, this.testId)
      .subscribe(references => {
        this.references = references;
      })
  }

  public getSystemName(reference: Reference): string {
    return this.systems.filter(system => system.id === reference.int_system)[0].name;
  }

  public deleteReference(link: Reference) {
    //TODO: remame variables
    // add call the service
    this.testReferenceService.delete(this.projectId, link.id)
      .subscribe(() => {
        this.references = this.references.filter(reference => (reference.id !== link.id));
      });
  }

  public addReference() {
    let reference = new Reference();
    reference.key = this.addLinkForm.controls.linkKey.value;
    reference.entity_id = this.testId;
    reference.int_system = this.addLinkForm.controls.linkSystem.value.id;
    reference.project_id = this.projectId;
    this.testReferenceService.create(reference)
      .subscribe(item => {
        this.references.push(item);
      });
  }
}
