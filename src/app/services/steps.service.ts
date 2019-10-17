import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Step, StepType } from '../shared/models/steps';


@Injectable()
export class StepsService extends SimpleRequester {

  getSteps(step: Step): Promise<Step[]> {
    return this.doGet('/steps', step).map(res => res.json()).toPromise();
  }

  createStep(step: Step): Promise<Step> {
    return this.doPost('/steps', step).map(res => res.json()).toPromise();
  }

  removeStep(step: Step): Promise<void> {
    return this.doDelete(`/steps`, step)
      .map(() => this.handleSuccess(`Test result '${step.id}' was deleted.`)).toPromise();
  }

  getStepTypes(stepType: StepType): Promise<Step[]> {
    return this.doGet('/stepType', stepType).map(res => res.json()).toPromise();
  }
}
