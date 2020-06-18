import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Step, StepResult, StepType, StepToTest } from 'src/app/shared/models/steps';

@Injectable()
export class StepsService extends BaseHttpService {
  getSteps(step: Step): Promise<Step[]> {
    return this.http.get<Step[]>('/steps', { params: this.convertToParams(step) }).toPromise();
  }

  async createStep(step: Step): Promise<Step> {
    const result = await this.http.post('/steps', step).toPromise();
    step.id
      ? this.handleSuccess(`The step '${step.id}' was updated.`)
      : this.handleSuccess(`The step '${step.name}' was created.`);
    return result;
  }

  async updateStepResult(stepResult: StepResult): Promise<StepResult> {
    const result = await this.http.post<StepResult>('/step/results', stepResult).toPromise();
    stepResult.id
      ? this.handleSuccess(`The step result '${stepResult.name}' was updated.`)
      : this.handleSuccess(`The step result '${stepResult.name}' was created.`);
    return;
  }

  async removeStep(step: Step): Promise<void> {
    await this.http.delete(`/steps`, { params: this.convertToParams(step) }).toPromise();
    this.handleSuccess(`The step '${step.id}' was deleted.`);
  }

  getStepTypes(stepType: StepType): Promise<Step[]> {
    return this.http.get<Step[]>('/stepType', { params: this.convertToParams(stepType) }).toPromise();
  }

  addStepToTest(stepToTest: StepToTest): Promise<StepToTest> {
    return this.http.post<StepToTest>('/test/steps', stepToTest).toPromise();
  }

  getTestSteps(stepToTest: StepToTest): Promise<Step[]> {
    return this.http.get<Step[]>('/test/steps', { params: this.convertToParams(stepToTest) }).toPromise();
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
    return this.http.post<Step[]>('/test/stepsOrder', stepsOrder).toPromise();
  }

  removeStepFromTest(link_id: number, projectId: number) {
    return this.http.delete('/test/steps', { params: { id: link_id.toString(), project_id: projectId.toString() } }).toPromise();
  }
}
