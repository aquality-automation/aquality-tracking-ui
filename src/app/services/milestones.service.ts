import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Milestone } from '../shared/models/milestone';


@Injectable()
export class MilestoneService extends SimpleRequester {

  getMilestone(milestone: Milestone ): Promise<Milestone[]> {
    return this.doGet('/milestone', milestone).map(res => res.json()).toPromise();
  }

  createMilestone(milestone: Milestone): Promise<Milestone>  {
    return this.doPost('/milestone', milestone).map(res => res.json()).toPromise();
  }

  removeTest(milestone: Milestone) {
    return this.doDelete(`/milestone?id=${milestone.id}`, )
      .map(() => this.handleSuccess(`Test '${milestone.name}' was deleted.`)).toPromise();
  }
}
