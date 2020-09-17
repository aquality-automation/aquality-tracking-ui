import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Milestone } from 'src/app/shared/models/milestones/milestone';
import { TestResult } from 'src/app/shared/models/test-result';


@Injectable()
export class MilestoneService extends BaseHttpService {

  getMilestone(milestone: Milestone): Promise<Milestone[]> {
    return this.http.get<Milestone[]>('/milestone', { params: this.convertToParams(milestone) }).toPromise();
  }

  createMilestone(milestone: Milestone): Promise<Milestone> {
    return this.http.post<Milestone>('/milestone', milestone).toPromise();
  }

  async removeMilestone(milestone: Milestone) {
    await this.http.delete(`/milestone`, { params: this.convertToParams(milestone) }).toPromise();
    this.handleSuccess(`Milestone '${milestone.name}' was deleted.`);
  }

  getMilestoneResults(milestone: Milestone): Promise<TestResult[]> {
    return this.http.get<TestResult[]>(`/milestone/results`, {
      params:
        { milestoneId: milestone.id.toString(), project_id: milestone.project_id.toString() }
    }).toPromise();
  }
}
