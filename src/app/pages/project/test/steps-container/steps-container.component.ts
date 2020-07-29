import { Component, OnInit, Input } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { StepType, Step } from '../../../../shared/models/steps';
import { ActivatedRoute } from '@angular/router';
import { faMinus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { StepsService } from 'src/app/services/steps/steps.service';

@Component({
  selector: 'steps-container',
  templateUrl: './steps-container.component.html',
  styleUrls: ['./steps-container.component.scss']
})
export class StepsContainerComponent implements OnInit {
  @Input() editable: boolean;

  constructor(
    private route: ActivatedRoute,
    private dragulaService: DragulaService,
    private stepService: StepsService
  ) { }

  public icons = {
    faMinus,
    faCheck,
  };
  public newStepType: StepType;
  public newStep: Step;
  public testSteps: Step[];
  public types: StepType[];
  public allExistingSteps: Step[];
  public filteredSteps: Step[];
  public newStepsOrder: Step[] = [];
  private testId: number;
  private projectId: number;

  async ngOnInit() {
    this.testId = this.route.snapshot.params['testId'];
    this.projectId = this.route.snapshot.params['projectId'];
    const bag: any = this.dragulaService.find('steps-bag');
    if (bag !== undefined) { this.dragulaService.destroy('steps-bag'); }
    this.dragulaService.createGroup('steps-bag', {
      moves: () => {
        return this.editable;
      },
      direction: 'vertical',
    });
    this.types = await this.stepService.getStepTypes({});
    this.testSteps = await this.getTestSteps();
    this.discardOrderChanges();
    this.allExistingSteps = await this.getSteps();
  }

  async addStep() {
    this.newStep.order = this.testSteps.length + 1;
    this.newStep.project_id = this.projectId;
    this.newStepsOrder.push(this.fillStep(this.newStep));
    this.newStepType = undefined;
    this.newStep = undefined;
  }

  async createStep(stepName: string) {
    const step = new Step();
    step.project_id = this.projectId;
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

  isOrderChanged() {
    return JSON.stringify(this.testSteps) !== JSON.stringify(this.newStepsOrder);
  }

  discardOrderChanges() {
    this.newStepsOrder = [];
    this.newStepsOrder = this.newStepsOrder.concat(this.testSteps);
  }

  getGherkinTestCase() {
    return this.generateGherkinTestCase();
  }

  async removeStep(index: number) {
    this.newStepsOrder.splice(index, 1);
  }

  async saveNewOrder() {
    this.fixStepsOrder();
    this.testSteps = this.fillSteps(await this.stepService.saveStepsOrder(this.newStepsOrder, this.testId, this.projectId));
    this.discardOrderChanges();
    this.stepService.handleSuccess('Test steps were updated!');
  }

  private async getSteps(): Promise<Step[]> {
    const steps = await this.stepService.getSteps({ project_id: this.projectId });
    return this.fillSteps(steps);
  }

  private fillSteps(steps: Step[]): Step[] {
    steps.forEach(step => step = this.fillStep(step));
    return steps;
  }

  fillStep(step: Step): Step {
    step.type = this.types.find(type => type.id === step.type_id);
    return step;
  }

  private generateGherkinTestCase() {
    const steps = [];
    this.newStepsOrder.forEach(step => steps.push(`\t${step.type.name} ${step.name}`));
    return steps.join('\n');
  }

  private async getTestSteps(): Promise<Step[]> {
    const steps = await this.stepService.getTestSteps({
      test_id: this.testId,
      project_id: this.projectId
    });
    return this.fillSteps(steps);
  }

  private fixStepsOrder() {
    for (let i = 0; i < this.newStepsOrder.length; i++) {
      this.newStepsOrder[i].order = i + 1;
    }
  }
}
