import { Component, OnInit } from '@angular/core';
import { StepsService } from '../../../../services/steps.service';
import { Step, StepType } from '../../../../shared/models/steps';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.services';
import { TFColumn, TFColumnType, TFSorting, TFOrder } from '../../../../elements/table/tfColumn';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from '../../../../services/current-permissions.service';

@Component({
  selector: 'app-steps-list',
  templateUrl: './steps-list.component.html',
  styleUrls: ['./steps-list.component.css']
})
export class StepsListComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private stepService: StepsService,
    private userService: UserService,
    private permissions: PermissionsService
  ) { }

  public steps: Step[];
  public stepTypes: StepType[];
  public columns: TFColumn[];
  public allowDelete: boolean;
  public allowCreate: boolean;
  public projectId: number = this.route.snapshot.params.projectId;
  public sortBy: TFSorting = { property: 'name', order: TFOrder.desc };

  async ngOnInit() {
    this.allowDelete = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer]);
    this.allowCreate = this.allowDelete;
    this.stepTypes = await this.stepService.getStepTypes({});
    this.steps = await this.getSteps();
    this.columns = this.getСolumns();
  }

  public handleAction(action: { action: any; entity: Step; }) {
    switch (action.action) {
      case 'create':
        this.createOrUpdateStep(action.entity);
        break;
      case 'remove':
        this.deleteStep(action.entity);
        break;
    }
  }

  private async createOrUpdateStep(step: Step) {
    step.project_id = this.projectId;
    step.type_id = step.type.id;
    await this.stepService.createStep(step);
    this.steps = await this.getSteps();
  }

  private async deleteStep(step: Step) {
    await this.stepService.removeStep({
      id: step.id,
      project_id: this.projectId
    });
    this.steps = await this.getSteps();
  }

  private async getSteps(): Promise<Step[]> {
    const steps = await this.stepService.getSteps({ project_id: this.projectId });
    steps.forEach(step => step.type = this.stepTypes.find(type => type.id === step.type_id));
    return steps;
  }

  private getСolumns(): TFColumn[] {
    return [
      {
        name: 'Type',
        property: 'type',
        filter: true,
        sorting: true,
        type: TFColumnType.autocomplete,
        lookup: {
          entity: 'type',
          propToShow: ['name'],
          values: this.stepTypes,
        },
        editable: this.allowCreate,
        class: 'fit',
        creation: {
          required: true
        }
      },
      {
        name: 'Name',
        property: 'name',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        editable: this.allowCreate,
        creation: {
          creationLength: 500,
          required: true
        }
      },
    ];
  }
}
