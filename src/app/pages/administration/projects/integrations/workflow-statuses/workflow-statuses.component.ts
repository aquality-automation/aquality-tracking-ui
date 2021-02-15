import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { stat } from 'fs';
import { SystemWorkflowStatusServiceService } from 'src/app/services/integrations/system-workflow-status-service.service';
import { SystemWorkflowStatusTypeServiceService } from 'src/app/services/integrations/system-workflow-status-type-service.service';
import { System } from 'src/app/shared/models/integrations/system';
import { SystemWorkflowStatus } from 'src/app/shared/models/integrations/system-workflow-status';
import { SystemWorkflowStatusType } from 'src/app/shared/models/integrations/system-workflow-status-type';

@Component({
  selector: 'app-workflow-statuses',
  templateUrl: './workflow-statuses.component.html',
  styleUrls: ['./workflow-statuses.component.scss']
})
export class WorkflowStatusesComponent implements OnInit {

  @Input() projectId: number;
  @Input() system: System;
  types: SystemWorkflowStatusType[] = [];
  addWorkflowStatusForm: FormGroup;
  statuses: SystemWorkflowStatus[] = [];

  constructor(
    private wflStatusTypeService: SystemWorkflowStatusTypeServiceService,
    private wflStatusService: SystemWorkflowStatusServiceService
  ) { }

  ngOnInit(): void {
    this.addWorkflowStatusForm = new FormGroup({
      type: new FormControl(''),
      name: new FormControl('')
    });

    this.wflStatusTypeService.getTypes().subscribe(types => {
      this.types = types;
      this.addWorkflowStatusForm.controls.type.setValue(types[0]);
    });

    this.wflStatusService.get(this.projectId, this.system.id).subscribe(statuses => {
      this.statuses = statuses;
    })
  }

  hasStatuses(): boolean{
    return this.statuses.length > 0;
  }

  addWorkflowStatus() {
    let status: SystemWorkflowStatus = new SystemWorkflowStatus();
    status.project_id = this.projectId;
    status.wf_sts_type_id =  this.addWorkflowStatusForm.controls.type.value.id;
    status.int_system_id = this.system.id;
    status.name = this.addWorkflowStatusForm.controls.name.value;
    this.wflStatusService.create(status).subscribe(status => {
      this.statuses.push(status);
    })
  }

  deleteStatus(status: SystemWorkflowStatus){
    this.wflStatusService.delete(this.projectId, status.id).subscribe(() => {
      this.statuses = this.statuses.filter(current => current.id !== status.id);
    })
  }
}
