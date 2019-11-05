import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Step, StepType, StepToTest, StepResult } from '../shared/models/steps';


@Injectable()
export class StepsService extends SimpleRequester {

  getSteps(step: Step): Promise<Step[]> {
    return this.doGet('/steps', step).map(res => res.json()).toPromise();
  }

  createStep(step: Step): Promise<Step> {
    return this.doPost('/steps', step).map(res => {
      step.id
        ? this.handleSuccess(`The step '${step.id}' was updated.`)
        : this.handleSuccess(`The step '${step.name}' was created.`);
      return res.json();
    }).toPromise();
  }

  updateStepResult(stepResult: StepResult): Promise<StepResult> {
    return this.doPost('/step/results', stepResult).map(res => {
      stepResult.id
        ? this.handleSuccess(`The step result '${stepResult.name}' was updated.`)
        : this.handleSuccess(`The step result '${stepResult.name}' was created.`);
      return res.json();
    }).toPromise();
  }

  removeStep(step: Step): Promise<void> {
    return this.doDelete(`/steps`, step)
      .map(() => this.handleSuccess(`The step '${step.id}' was deleted.`)).toPromise();
  }

  getStepTypes(stepType: StepType): Promise<Step[]> {
    return this.doGet('/stepType', stepType).map(res => res.json()).toPromise();
  }

  addStepToTest(stepToTest: StepToTest): Promise<StepToTest> {
    return this.doPost('/test/steps', stepToTest).map(res => res.json()).toPromise();
  }

  getTestSteps(stepToTest: StepToTest): Promise<Step[]> {
    return this.doGet('/test/steps', stepToTest).map(res => res.json()).toPromise();
  }

  saveStepsOrder(newStepsOrder: Step[], test_id: number, project_id: number): Promise<Step[]> {
    const stepsOrder = newStepsOrder.map((step, index) => {
      return {
        id: step.link_id,
        project_id,
        step_id: step.id,
        test_id,
        order: index + 1
      };
    });
    return this.doPost('/test/stepsOrder', stepsOrder).map(res => res.json()).toPromise();
  }

  removeStepFromTest(link_id: number, projectId: number) {
    return this.doDelete('/test/steps', {id: link_id, project_id: projectId}).toPromise();
  }
}
