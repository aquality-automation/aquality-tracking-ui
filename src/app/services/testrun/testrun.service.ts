import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { TestRun, TestRunLabel } from 'src/app/shared/models/testrun';
import { TestRunStat } from 'src/app/shared/models/testrun-stats';
import { User } from 'src/app/shared/models/user';

@Injectable()
export class TestRunService extends BaseHttpService {

  getTestRun(testRun: TestRun, limit: number = 0): Promise<TestRun[]> {
    testRun = this.setProjectId(testRun);
    testRun['limit'] = limit;
    return this.http.get<TestRun[]>(`/testrun`, { params: this.convertToParams(testRun) }).toPromise();
  }

  getTestRunWithChilds(testRun: TestRun, limit: number = 0): Promise<TestRun[]> {
    testRun = this.setProjectId(testRun);
    testRun['limit'] = limit;
    testRun['withChildren'] = 1;
    return this.http.get<TestRun[]>(`/testrun`, { params: this.convertToParams(testRun) }).toPromise();
  }

  createTestRun(testRun: TestRun): Promise<TestRun> {
    testRun = this.setProjectId(testRun);
    if (testRun.testResults) {
      testRun.testResults = undefined;
    }
    return this.http.post<TestRun>('/testrun', testRun).toPromise();
  }

  async removeTestRun(toRemove: TestRun | TestRun[]): Promise<void> {
    if (Array.isArray(toRemove)) {
      await this.http.request('delete', `/testrun`, { body: toRemove }).toPromise();
      this.handleSuccess(`Test runs were deleted.`);
    }
    const testRun = this.setProjectId(toRemove as TestRun);
    await this.http.delete(`/testrun`, { params: this.convertToParams({ id: testRun.id, project_id: testRun.project_id }) }).toPromise();
    this.handleSuccess(`Test run '${testRun.build_name}/${testRun.start_time}' was deleted.`);
  }

  getTestsRunStats(testRun: TestRun, overlay: boolean = true): Promise<TestRunStat[]> {
    testRun = this.setProjectId(testRun);
    return this.http.get<TestRunStat[]>('/stats/testrun', { params: this.convertToParams(testRun) }).toPromise();
  }

  getTestsRunLabels(id?: number) {
    const queryParams: TestRunLabel = { id };
    return this.http.get<TestRunLabel[]>(`/testrun/labels`, { params: this.convertToParams(queryParams) }).toPromise();
  }

  sendReport(testRun: TestRun, users: User[]) {
    return this.http.post(`/testrun/report`, users, { params: { test_run_id: testRun.id.toString() } }).toPromise();
  }

  calculateDuration(testRun: TestRun | TestRunStat): string {
    const start_time = new Date(testRun.start_time);
    const finish_time = new Date(testRun.finish_time);
    const duration = (finish_time.getTime() - start_time.getTime()) / 1000;
    const hours = (duration - duration % 3600) / 3600;
    const minutes = (duration - hours * 3600 - (duration - hours * 3600) % 60) / 60;
    const seconds = duration - (hours * 3600 + minutes * 60);
    return hours + 'h:' + minutes + 'm:' + seconds + 's';
  }

  getPassRate(stat: TestRunStat): string | number {
    return stat ? ((stat.passed / stat.total) * 100).toFixed(2) : 0;
  }

  private setProjectId(testRun: TestRun): TestRun {
    if (!testRun.project_id) {
      testRun.project_id = this.currentProjectId;
    }
    return testRun;
  }
}
