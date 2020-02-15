import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Milestone } from '../shared/models/milestone';
import { TestResult } from '../shared/models/test-result';


@Injectable()
export class MilestoneService extends SimpleRequester {

  getMilestone(milestone: Milestone ): Promise<Milestone[]> {
    return this.doGet('/milestone', milestone).map(res => res.json()).toPromise();
  }

  createMilestone(milestone: Milestone): Promise<Milestone>  {
    return this.doPost('/milestone', milestone).map(res => res.json()).toPromise();
  }

  removeMilestone(milestone: Milestone) {
    return this.doDelete(`/milestone?id=${milestone.id}`, )
      .map(() => this.handleSuccess(`Milestone '${milestone.name}' was deleted.`)).toPromise();
  }

  getMilestoneResults(milestone: Milestone): Promise<TestResult[]> {
    return this.doGet(`/milestone/results`, { milestoneId : milestone.id}, true).map(res => res.json()).toPromise();
  }
}
