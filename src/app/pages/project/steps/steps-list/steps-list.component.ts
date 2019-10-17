import { Component, OnInit } from '@angular/core';
import { StepsService } from '../../../../services/steps.service';
import { Step, StepType } from '../../../../shared/models/steps';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-steps-list',
  templateUrl: './steps-list.component.html',
  styleUrls: ['./steps-list.component.css']
})
export class StepsListComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private stepService: StepsService
  ) { }

  public steps: Step[];
  public stepTypes: StepType[];
  public allowDelete = true;
  public allowCreate = true;
  public columns: any[];

  async ngOnInit() {
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
    step.project_id = this.route.snapshot.params['projectId'];
    step.type_id = step.type.id;
    await this.stepService.createStep(step);
    this.steps = await this.getSteps();
  }

  private async deleteStep(step: Step) {
    await this.stepService.removeStep({
      id: step.id,
      project_id: this.route.snapshot.params['projectId']
    });
    this.steps = await this.getSteps();
  }

  private async getSteps(): Promise<Step[]> {
    const steps = await this.stepService.getSteps({ project_id: this.route.snapshot.params['projectId'] });
    steps.forEach(step => step.type = this.stepTypes.find(type => type.id === step.type_id));
    return steps;
  }

  private getСolumns() {
    return [
      {
        name: 'Type',
        property: 'type',
        filter: true,
        sorting: true,
        type: 'lookup-autocomplete',
        propToShow: ['name'],
        entity: 'type',
        values: this.stepTypes,
        editable: true,
        class: 'fit'
      },
      {
        name: 'Name',
        property: 'name',
        filter: true,
        sorting: true,
        type: 'text',
        editable: true,
        creationLength: '500'
      },
    ];
  }
}
