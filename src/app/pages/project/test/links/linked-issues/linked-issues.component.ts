import { Component, OnInit } from '@angular/core';
import { IntegrationSystemService } from 'src/app/services/integrations/integration-system.service';
import { IntegrationSystem } from 'src/app/shared/models/integration-system';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { IntegrationTestService } from 'src/app/services/integrations/integration-test.service';
import { IntegrationTest } from 'src/app/shared/models/integration-test';

@Component({
  selector: 'app-linked-issues',
  templateUrl: './linked-issues.component.html',
  styleUrls: ['./linked-issues.component.scss']
})
export class LinkedIssuesComponent implements OnInit {

  addLinkForm: FormGroup;

  systems: IntegrationSystem[] = [];

  constructor(
    private integrationSystemService: IntegrationSystemService,
    private integrationTestService: IntegrationTestService
  ) { }

  ngOnInit(): void {
    this.addLinkForm = new FormGroup({
      linkKey: new FormControl('', Validators.minLength(2)),
      linkSystem: new FormControl('')
    });

    this.integrationSystemService.getIntegrationSystems()
      .subscribe(systems => {
        this.systems = systems;
        this.addLinkForm.controls.linkSystem.setValue(systems[0]);
      })
  }

  public deleteLink(link: IntegrationSystem) {
    //TODO: remame variables
    // add call the service
    this.systems = this.systems.filter(system => (system.name !== link.name));
  }

  public addLink() {
    let link = new IntegrationTest();
    link.key = this.addLinkForm.controls.linkKey.value;
    link.test_id = 109806; //TODO: need to find how to get id. Probably via @Input()
    link.integration_system_id = this.addLinkForm.controls.linkSystem.value.id;
    //TODO: need to find how to get id. 
    //Maybe there is some storage with common data like current project?
    link.project_id = 70;
    console.log(`link to add ${link.key}`)
    this.integrationTestService.createLink(link)
      .subscribe(item => {
        console.log(`Added item was ${item.key}`)
      }
      );
  }
}
