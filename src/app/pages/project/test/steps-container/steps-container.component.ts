import { Component, OnInit } from '@angular/core';
import { SimpleRequester } from '../../../../services/simple-requester';
import { DragulaService } from 'ng2-dragula';
import { StepType, Step } from '../../../../shared/models/steps';
import { StepsService } from '../../../../services/steps.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'steps-container',
  templateUrl: './steps-container.component.html',
  styleUrls: ['./steps-container.component.css']
})
export class StepsContainerComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private simpleService: SimpleRequester,
    private dragulaService: DragulaService,
    private stepService: StepsService
  ) { }

  public newStepType: StepType;
  public newStep: Step;
  public newStepOrder: number;
  public testSteps: Step[];
  public types: StepType[];
  public allExistingSteps: Step[];
  public filteredSteps: Step[];

  async ngOnInit() {
    this.types = await this.stepService.getStepTypes({});
    this.testSteps = await this.getTestSteps();
    this.allExistingSteps = await this.getSteps();
    this.newStepOrder = this.testSteps.length + 1;
  }

  async addStep() {
    this.stepService.addStepToTest({
      step_id: this.newStep.id,
      test_id: this.route.snapshot.params['testId'],
      order: this.newStepOrder,
      project_id: this.route.snapshot.params['projectId']
    });
    this.newStepType = undefined;
    this.newStep = undefined;
    this.testSteps = await this.getTestSteps();
    this.newStepOrder = this.testSteps.length + 1;
  }

  async createStep(stepName: string) {
    const step = new Step();
    step.project_id = this.route.snapshot.params['projectId'];
    step.type_id = this.newStepType.id;
    step.name = stepName;
    this.newStep = await this.stepService.createStep(step);
    this.allExistingSteps = await this.getSteps();
    this.setFilteredSteps();
  }

  setNewStepType(type: StepType) {
    this.newStepType = type;
    this.newStep = undefined;
    this.setFilteredSteps();
  }

  setFilteredSteps() {
    this.filteredSteps = this.allExistingSteps.filter(step => step.type_id === this.newStepType.id);
  }

  private async getSteps(): Promise<Step[]> {
    const steps = await this.stepService.getSteps({ project_id: this.route.snapshot.params['projectId'] });
    steps.forEach(step => step.type = this.types.find(type => type.id === step.type_id));
    return steps;
  }

  private async getTestSteps(): Promise<Step[]> {
    const steps = await this.stepService.getTestSteps({
      test_id: this.route.snapshot.params['testId'],
      project_id: this.route.snapshot.params['projectId']
    });
    steps.forEach(step => step.type = this.types.find(type => type.id === step.type_id));
    return steps;
  }
}
