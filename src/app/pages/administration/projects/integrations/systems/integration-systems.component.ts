import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SystemTypeService } from 'src/app/services/integrations/system-type.service';
import { SystemService } from 'src/app/services/integrations/system.service';
import { TtsTypeService } from 'src/app/services/integrations/tts-type.service';
import { System } from 'src/app/shared/models/integrations/system';
import { SystemType } from 'src/app/shared/models/integrations/system-type';
import { TtsType } from 'src/app/shared/models/integrations/tts-type';

@Component({
  selector: 'app-integration-systems',
  templateUrl: './integration-systems.component.html',
  styleUrls: ['./integration-systems.component.scss']
})
export class IntegrationSystemsComponent implements OnInit {

  @Input() projectId: number;

  ngOnChanges() {
    this.loadSystems();
  }

  systemTypes: SystemType[] = [];
  ttsTypes: TtsType[] = [];
  systems: System[] = [];

  addSystemForm: FormGroup;

  constructor(
    private systemService: SystemService,
    private systemTypeService: SystemTypeService,
    private ttsTypeService: TtsTypeService
  ) {
  }

  ngOnInit(): void {

    this.addSystemForm = new FormGroup(
      {
        type: new FormControl(''),
        ttsType: new FormControl(''),
        name: new FormControl(''),
        url: new FormControl(''),
        username: new FormControl(''),
        password: new FormControl(''),
        apiToken: new FormControl('')
      }
    );

    this.systemTypeService.getTypes().subscribe(types => {
      this.systemTypes = types;
      this.addSystemForm.controls.type.setValue(types[0]);
    });

    this.ttsTypeService.getTypes().subscribe(types => {
      this.ttsTypes = types;
      this.addSystemForm.controls.ttsType.setValue(types[0]);
    });

    this.loadSystems();
  }

  public loadSystems(): void {
    this.systemService.getAll(this.projectId).subscribe(systems => {
      this.systems = systems;
    })
  }

  public addSystem() {
    let system: System = new System();
    system.name = this.addSystemForm.controls.name.value;
    system.url = this.addSystemForm.controls.url.value;
    system.username = this.addSystemForm.controls.username.value;
    system.password = this.addSystemForm.controls.password.value;
    system.api_token = this.addSystemForm.controls.apiToken.value;
    system.int_system_type = this.addSystemForm.controls.type.value.id;
    system.int_tts_type = this.addSystemForm.controls.ttsType.value.id;
    system.project_id = this.projectId;
    this.systemService.create(system).subscribe(system => {
      this.systems.push(system);
    })
  }

  public getSystemTypeName(system: System): string {
    return this.systemTypes.filter(type => type.id === system.int_system_type)[0]?.name;
  }

  public deleteSystem(system: System) {
    this.systems = this.systems.filter(current => (current.id !== system.id));
  }
}
